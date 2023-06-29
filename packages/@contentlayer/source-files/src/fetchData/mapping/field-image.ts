import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { fs, unknownToRelativePosixFilePath } from '@contentlayer/utils'
import { identity, OT, pipe, T } from '@contentlayer/utils/effect'
import type * as ImageScript from 'imagescript'
import type sharp from 'sharp'

import { FetchDataError } from '../../errors/index.js'
import type { HasDocumentContext } from '../DocumentContext.js'
import { getFromDocumentContext } from '../DocumentContext.js'
import type { ParsedFieldData } from './parseFieldData.js'

export const makeImageField = ({
  imageData,
  documentFilePath,
  contentDirPath,
  fieldDef,
}: {
  imageData: ParsedFieldData<'image'>
  documentFilePath: utils.RelativePosixFilePath
  contentDirPath: utils.AbsolutePosixFilePath
  fieldDef: core.FieldDef
}) =>
  T.gen(function* ($) {
    const imageFieldData = yield* $(
      getImageFieldData({
        imagePath: imageData.src,
        documentFilePath,
        contentDirPath,
        fieldDef,
      }),
    )

    return identity<core.ImageFieldData>({ ...imageFieldData, alt: imageData.alt })
  })

const getImageFieldData = ({
  documentFilePath,
  contentDirPath,
  fieldDef,
  imagePath: imagePath_,
}: {
  documentFilePath: utils.RelativePosixFilePath
  contentDirPath: utils.AbsolutePosixFilePath
  fieldDef: core.FieldDef
  imagePath: string
}): T.Effect<
  OT.HasTracer & core.HasCwd & HasDocumentContext & fs.HasFs,
  FetchDataError.ImageError,
  core.ImageFieldData
> =>
  pipe(
    T.gen(function* ($) {
      const cwd = yield* $(core.getCwd)
      const imagePath = unknownToRelativePosixFilePath(imagePath_, cwd)
      const documentDirPath = utils.dirname(documentFilePath)

      const filePath = utils.filePathJoin(documentDirPath, imagePath)
      const absoluteFilePath = utils.filePathJoin(contentDirPath, documentDirPath, imagePath)
      const relativeFilePath = utils.relative(utils.filePathJoin(contentDirPath, documentDirPath), absoluteFilePath)

      const fileBuffer = yield* $(fs.readFileBuffer(absoluteFilePath))

      const { resizedData, height, width, format } = yield* $(processImage(fileBuffer))

      const aspectRatio = width / height

      const dataB64 = utils.base64.encode(resizedData)
      const blurhashDataUrl = `data:image/${format};base64,${dataB64}`

      return identity<core.ImageFieldData>({
        filePath,
        relativeFilePath,
        format,
        height,
        width,
        aspectRatio,
        blurhashDataUrl,
      })
    }),
    T.catchAll((error) =>
      pipe(
        getFromDocumentContext('documentTypeDef'),
        T.chain((documentTypeDef) =>
          T.fail(
            new FetchDataError.ImageError({
              error,
              documentFilePath,
              fieldDef,
              imagePath: imagePath_,
              documentTypeDef,
            }),
          ),
        ),
      ),
    ),
    OT.withSpan('getImageFieldData', { attributes: { imagePath: imagePath_ } }),
  )

let SharpModule: typeof sharp | undefined = undefined
let ImageScriptModule: typeof ImageScript | undefined = undefined

/**
 * This function tries to use `sharp` to process the image as sharp runs natively on Node.js but only if the user
 * has `sharp` installed. Contentlayer doesn't depend on `sharp` directly as it's rather slow to install.
 * As a fallback Contentlayer uses `imagescript` to process the image.
 */
const processImage = (fileBuffer: Buffer) =>
  T.gen(function* ($) {
    if (SharpModule === undefined && ImageScriptModule === undefined) {
      yield* $(
        pipe(
          T.tryPromise(() => import('sharp')),
          // NOTE `sharp` is still a CJS module, so default import is needed
          T.tap((_) => T.succeedWith(() => (SharpModule = _.default))),
          T.catchAll(() =>
            pipe(
              T.tryPromise(() => import('imagescript')),
              T.tap((_) => T.succeedWith(() => (ImageScriptModule = _))),
            ),
          ),
          OT.withSpan('importSharpOrImageScript'),
        ),
      )
    }

    if (SharpModule) {
      return yield* $(processImageWithSharp(fileBuffer))
    } else {
      return yield* $(processImageWithImageScript(fileBuffer))
    }
  })

const processImageWithImageScript = (fileBuffer: Buffer) =>
  pipe(
    T.gen(function* ($) {
      const format = ImageScriptModule!.ImageType.getType(fileBuffer)
      if (format === null) {
        return yield* $(T.fail(new Error('Could not determine image type')))
      }

      const image = yield* $(
        pipe(
          T.tryPromise(() => ImageScriptModule!.decode(fileBuffer)),
          OT.withSpan('decodeImage'),
        ),
      )

      const { width, height } = image

      image.resize(8, 8)
      const resizedData = yield* $(
        pipe(
          T.tryPromise(() => image.encode(70)),
          OT.withSpan('resizeImage'),
        ),
      )

      return { resizedData, width, height, format }
    }),
    OT.withSpan('processImageWithImageScript'),
  )

const processImageWithSharp = (fileBuffer: Buffer) =>
  pipe(
    T.gen(function* ($) {
      const sharpImage = SharpModule!(fileBuffer)

      const metadata = yield* $(T.tryPromise(() => sharpImage.metadata()))

      if (metadata.width === undefined || metadata.height === undefined || metadata.format === undefined) {
        return yield* $(T.fail(new Error('Could not determine image dimensions')))
      }

      const { width, height, format } = metadata

      const resizedInfo = yield* $(
        pipe(
          T.tryPromise(() => {
            const quality = 70

            switch (format) {
              case 'jpeg':
                sharpImage.jpeg({ quality })
                break
              case 'webp':
                sharpImage.webp({ quality })
                break
              case 'png':
                sharpImage.png({ quality })
                break
              case 'avif':
                sharpImage.avif({ quality })
                break
            }

            return sharpImage.resize(8, 8).toBuffer({ resolveWithObject: true })
          }),
          OT.withSpan('resizeImage', { attributes: { width, height, format } }),
        ),
      )

      return { resizedData: resizedInfo.data, width, height, format }
    }),
    OT.withSpan('processImageWithSharp'),
  )
