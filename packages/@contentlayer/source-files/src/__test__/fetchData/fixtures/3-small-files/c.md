---
title: How to do Enums in Go
tags:
categories:
  - Software development
  - Golang
date: 2021-05-03T21:10:14.000Z
coverImage: /images/dd1fa73a1e577a0a4b58350ee88676c375044767.png
---

It has been a while since I wrote a blog on Go. Since I'm getting the question if Go supports enums every now and then, I thought it would be good to write an article on how to do `enums` in Go.

Go natively does **NOT** have an `enum` type like you might be used to from `c#` or `Java`. However that doesn't mean we can easily define our own type.

In this blog we will cover defining our own type, combined with a piece of code generation. If you are new to `Go`, then consider reading [Start on your first Go project](start-golang) first.

Enums make up a nice API experience for consumers of your library by adding some type safety and giving the developer consuming the library some guidance on the available values.

Now we could use `strings` all over the place to pass our values, however using an enum is also more efficient as we will be using an `integer` to express and store these values in memory. You might be thinking… How can an integer be more convenient for the users of my library? Well, they aren't so let me show you how to get that Enum like developer experience in Go.

<Adsense
client="ca-pub-5023539608753938"
slot="3392827205"
format="fluid"
layout="in-article"
style={{ display: "block", textAlign: "center" }}
responsive="true"
/>

Imagine we are building a simple car configuration tool that allows to define the brand and color of a car. To offer a nice API for the consumer of our `car` package I want to offer them some predefined values (Enums) from which they can pick a brand and color. For the car model I go with a free format string as there are too many variations.

First lets have a look on the code I would like to write as a consumer of my `car` package.

```go:main.go
package main

import (
  "fmt"

  "github.com/marcofranssen/go-enum-tutorial/car"
)

func main() {
  bmw := car.New(car.BMW, car.Gray, "320i GT")
  ferrari := car.New(car.Ferrari, car.Red, "SF90 Stadala")

  fmt.Printf("I own a '%s' and dream about a '%s'…\n", bmw, ferrari)
}
```

Running this program should print the following output.

```bash:terminal
$ go run .
I own a 'BMW 320i GT (gray)' and dream about a 'Ferrari SF90 Stadala (red)'…
```

By using an enum for the `Brand` and `Color` I get a very nice API to use my `car` package as a developer. It adds type safety as well it offers a predefined list of choices for brands and colors.

Now let's have a look on how we can define the struct and constructor function in our `car` package first.

```go:car/car.go
package car

type Car struct {
  Brand Brand
  Color Color
  Model string
}

func New(brand Brand, color Color, model string) *Car {
  return &Car{
    Brand: brand,
    Color: color,
    Model: model,
  }
}
```

You notice that in this constructor I have used some custom types for `Brand` and `Color`. Lets have a look on how we can define these custom types and give them an enum like behavior.

<Adsense
client="ca-pub-5023539608753938"
slot="3392827205"
format="fluid"
layout="in-article"
style={{ display: "block", textAlign: "center" }}
responsive="true"
/>

```go:car/brand.go
package car

type Brand int

const (
  BMW Brand = iota
  Mercedes
  Audi
  Toyota
  Volkswagen
  Porsche
  Ferrari
)
```

What we did here is defining a custom type `Brand` that is stored in memory as an integer. Then we define some predefined values as constants using `iota`. `iota` adds auto incremented values for a group of constants. Read more on `iota` [here](https://github.com/golang/go/wiki/Iota).

When compiling this code this will in practice result in the following values being assigned to the constant fields we defined.

| Field      | Value |
| ---------- | ----: |
| BMW        |     0 |
| Mercedes   |     1 |
| Audi       |     2 |
| Toyota     |     3 |
| Volkswagen |     4 |
| Porsche    |     5 |
| Ferrari    |     6 |

Now you can do the same to define a `Color` type. Please go ahead and try that on your own. Ensure you define at least the colors `Gray` and `Red` to continue this tutorial.

<Adsense
client="ca-pub-5023539608753938"
slot="3392827205"
format="fluid"
layout="in-article"
style={{ display: "block", textAlign: "center" }}
responsive="true"
/>

Now if I would run my code we will notice it doesn't print that nicely as we have shown before.

```bash:terminal
$ go run .
I own a '&{%!s(main.Brand=0) %!s(main.Color=0) 320i GT}' and dream about a '&{%!s(main.Brand=6) %!s(main.Color=1) SF90 Stadala}'…
```

The reason for this ugly output is that our `Car` type does **NOT** implement the [Stringer][stringer] interface. We are using `%s` with our `fmt.Printf` invocation to print our type as a String, therefore we need to implement the `stringer` interface to define how our `Car` prints as a `string`.

Interfaces in Go are implicit which means we don't need to define which interface we implement. We only need to add the function from the [Stringer][stringer] interface on our type.

> To know more about interfaces in Go check out my other blog on [interface and type assertions][interfaces-type-assertions]. Now lets add this function to our `Car` type.

```go:car/car.go
func(c Car) String() string {
  return fmt.Sprintf("%s %s (%s)", c.Brand, c.Model, c.Color)
}
```

Although this prints already slightly better we still don't get the desired output for our `Brand` and `Color` types.

```bash:terminal
$ go run .
I own a '%!s(main.Brand=0) 320i GT (%!s(main.Color=0))' and dream about a '%!s(main.Brand=6) SF90 Stadala (%!s(main.Color=1))'…
```

Guess what?! We also need to implement the [Stringer][stringer] interface for our `Brand` and `Color` types. However this time I don't want to manually implement this. I want to generate the implementation so I can easily update it when we are adding new constant values for theses types in the future.

To generate the implementation we will use a tool called `stringer`. We can install this tool using the following command.

```bash:terminal
go install golang.org/x/tools/cmd/stringer
```

Now in code we can add a `//go:generate stringer -type=Brand` statement to generate the `String` method on our type. I prefer to add this as a comment in front of my type definition, but in practice this can be anywhere in your package.

```go:car/brand.go
package car

//go:generate stringer -type=Brand
type Brand int

const (
  BMW Brand = iota
  Mercedes
  Audi
  Toyota
  Volkswagen
  Porsche
  Ferrari
)
```

> `//go:generate` is a special type of comment that that will be executed when we use `go generate`.

Same we will do for our `Color` type.

With the tool and the comment in place we can now simply run `go generate ./...`. This will create a new file called `car/brand_string.go` and a new file called `car/color_string.go`. Go ahead and have a look at the generated code. Now every time you changed your constants, e.g. added new values changed order or removed values, simply run `go generate ./...` again.

If we run our program now, we finally get the desired output.

```bash:terminal
$ go run .
I own a 'BMW 320i GT (Gray)' and dream about a 'Ferrari SF90 Stadala (Red)'…
```

Although this is already pretty neat, I would like to add one more thing to be able to marshal and unmarshal our values to and from JSON as a `string`. Lets start with marshalling to JSON. To do so we will implement the [TextMarshaler][textmarshaler] interface on our `Brand` type.

```go:car/brand.go
func (b Brand) MarshalText() ([]byte, error) {
  return []byte(b.String()), nil
}
```

Before we do the same for our `Color` type I suggest we will first try to print some JSON so we can see the difference if we don't implement this [TextMarshaler][textmarshaler] interface.

Add following tags to your `Car` type so it nicely uses lowercased keys for our JSON.

```go:car/car.go
type Car struct {
  Brand Brand  `json:"brand,omitempty"`
  Color Color  `json:"color,omitempty"`
  Model string `json:"model,omitempty"`
}
```

Lets now try to print our Car as JSON by adding a piece of code to our main function.

```go:main.go
func main() {
  bmw := car.New(car.BMW, car.Gray, "320i GT")
  ferrari := car.New(car.Ferrari, car.Red, "SF90 Stadala")

  fmt.Printf("I own a '%s' and dream about a '%s'…\n", bmw, ferrari)

  cars := []*car.Car{bmw, ferrari}
  carsJSON, err := json.Marshal(cars)
  if err != nil {
    fmt.Println(err)
  }
  fmt.Println(string(carsJSON))
}
```

Our program now shows following output:

```bash:terminal
$ go run .
I own a 'BMW Gray (320i GT)' and dream about a 'Ferrari Red (SF90 Stadala)'…
[{"brand":"BMW","color":1,"model":"320i GT"},{"brand":"Ferrari","color":2,"model":"SF90 Stadala"}]
```

As you can see we now nicely have our `Brand` printed as a string in our JSON, but the `Color` is still represented as an integer in our JSON. Go ahead and implement the [TextMarshaler][textmarshaler] interface for your `Color` type.

Once done, you should see both **brand** and **color** as a `string` in the JSON.

```bash:terminal
$ go run .
I own a 'BMW 320i GT (Gray)' and dream about a 'Ferrari SF90 Stadala (Red)'…
[{"brand":"BMW","color":"Gray","model":"320i GT"},{"brand":"Ferrari","color":"Red","model":"SF90 Stadala"}]
```

So what if we would like to unmarshal JSON into our struct? For that we need to implement the [TextUnmarshaler][textunmarshaler] interface.

```go:car/brand.go
func (b *Brand) UnmarshalText(text []byte) error {
  *b = BrandFromText(string(text))
  return nil
}

func BrandFromText(text string) Brand {
  switch strings.ToLower(text) {
  default:
    return Unknown
  case "bmw":
    return BMW
  case "mercedes":
    return Mercedes
  case "audo":
    return Audi
  case "toyota":
    return Toyota
  case "volkswagen":
    return Volkswagen
  case "porsche":
    return Porsche
  case "ferrari":
    return Ferrari
  }
}
```

Do the same for our `Color` type and add some code to our main function to create another car from a JSON string.

```go:main.go
  porscheJSON := []byte(`{"brand":"porsche","color":"White","model":"Taycan"}`)
  var porsche car.Car
  err = json.Unmarshal(porscheJSON, &porsche)
  if err != nil {
    fmt.Println(err)
    return
  }

  fmt.Printf("Another Car I love: %s", porsche)
```

Now before popping a :beer: lets run our application one more time to see the result.

> :warning: Please note if you forget to regenerate the stringer implementation for your types you will get something like following message.
>
> ```bash:terminal
> $ go run .
> # github.com/marcofranssen/go-enum-tutorial/car
> car/brand_string.go:11:7: invalid array index BMW - 0 (out of bounds for 1-element array)
> car/brand_string.go:12:7: invalid array index Mercedes - 1 (out of bounds for 1-element array)
> car/brand_string.go:13:7: invalid array index Audi - 2 (out of bounds for 1-element array)
> car/brand_string.go:14:7: invalid array index Toyota - 3 (out of bounds for 1-element array)
> car/brand_string.go:15:7: invalid array index Volkswagen - 4 (out of bounds for 1-element array)
> car/brand_string.go:16:7: invalid array index Porsche - 5 (out of bounds for 1-element array)
> car/brand_string.go:17:7: invalid array index Ferrari - 6 (out of bounds for 1-element array)
> ```

Go ahead and regenerate the code and run your application again.

```bash:terminal
$ go generate ./...
$ go run .
I own a 'BMW 320i GT (Gray)' and dream about a 'Ferrari SF90 Stadala (Red)'…
[{"brand":"BMW","color":"Gray","model":"320i GT"},{"brand":"Ferrari","color":"Red","model":"SF90 Stadala"}]
Another Car I love: Porsche Taycan (White)
```

**Congratulations** :tada:, you made it to the end of this article. Want to learn more about Golang? Consider reading [my other articles on Go][golang-blogs].

Leave me a comment down below in the comments section.

## TL;DR

The layout of our project looks like this.

```bash:terminal
$ tree .
.
├── car
│   ├── brand.go
│   ├── brand_string.go
│   ├── car.go
│   ├── color.go
│   └── color_string.go
├── go.mod
└── main.go
```

<CodeBlock
  title="go.mod"
  language="go"
  url="go-enum-tutorial/go.mod"
/>

<CodeBlock
  title="main.go"
  language="go"
  url="go-enum-tutorial/main.go"
/>

<CodeBlock
  title="car/car.go"
  language="go"
  url="go-enum-tutorial/car/car.go"
/>

<CodeBlock
  title="car/brand.go"
  language="go"
  url="go-enum-tutorial/car/brand.go"
/>

<CodeBlock
  title="car/car.go"
  language="go"
  url="go-enum-tutorial/car/car.go"
/>

Before running the application we will generate `{brand,color}_string.go` using the following command. We will also need to install the stringer generation tool first.

```bash:terminal
go install golang.org/x/tools/cmd/stringer
go generate ./...
```

Now we can run our application.

```bash:terminal
$ go run .
I own a 'BMW 320i GT (Gray)' and dream about a 'Ferrari SF90 Stadala (Red)'…
[{"brand":"BMW","color":"Gray","model":"320i GT"},{"brand":"Ferrari","color":"Red","model":"SF90 Stadala"}]
Another Car I love: Porsche Taycan (White)
```

Curious how it all works? Then read the full article.

## References

- [Start your first Golang project][start-golang]
- [Go interfaces and type assertions][interfaces-type-assertions]
- [Stringer interface][stringer]
- [TextMarshaler interface][textmarshaler]
- [TextUnMarshaler interface][textunmarshaler]
- [Full code at Github](https://github.com/marcofranssen/go-enum-tutorial)

[stringer]: https://golang.org/pkg/fmt/#Stringer
[textmarshaler]: https://golang.org/pkg/encoding/#TextMarshaler
[textunmarshaler]: https://golang.org/pkg/encoding/#TextUnMarshaler
[start-golang]: /start-on-your-first-golang-project 'Start on your first Golang project'
[interfaces-type-assertions]: /go-interfaces-and-type-assertions 'Go interfaces and type assertions'
[golang-blogs]: /categories/golang 'My personal articles on Go'

Please leave me a comment below.
