import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'

/** Needed in combination with `InferGetServerSidePropsType` */
export function defineServerSideProps<Fn extends GetServerSideProps>(
  fn: Fn,
): Fn {
  return fn
}

/** Needed in combination with `InferGetStaticPropsType` */
export function defineStaticProps<Fn extends GetStaticProps>(fn: Fn): Fn {
  return fn
}

export function defineStaticPaths<Fn extends GetStaticPaths>(fn: Fn): Fn {
  return fn
}
