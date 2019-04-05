# REST In Peace

An expressive REST client for TypeScript

[![Build Status](https://travis-ci.com/digiwinfr/rip.svg?branch=develop)](https://travis-ci.com/digiwinfr/rip)
[![Coverage Status](https://coveralls.io/repos/github/digiwinfr/rip/badge.svg?branch=develop)](https://coveralls.io/github/digiwinfr/rip?branch=develop)
[![Maintainability](https://api.codeclimate.com/v1/badges/2118b0ff758b5e29cefb/maintainability)](https://codeclimate.com/github/digiwinfr/rip/maintainability)

## Introduction

RIP allows you to easily write more expressive REST client classes.  
It is largely inspired by [Retrofit](https://square.github.io/retrofit/) from [Square](https://squareup.com).



## Installation

**:warning: RIP is under development, and is not yet published on npmjs**

```bash
npm install @digiwin/rip --save
```

You must enable the experimentalDecorators compiler option in your tsconfig.json:

```bash
{
    "compilerOptions": {
        ...
        "experimentalDecorators": true
    }
}
```

## Configuration

Rip does'nt depend on any http service. You can use a built-in service like fetch or xhr, or a library's adapter.

You must configure the http service to use with RIP :
 
### Using with fetch api

```typescript
const rip = Rip.getInstance();
rip.setHTTPService(new FetchHTTPService());
```

### Using with XMLHttpRequest

```typescript
const rip = Rip.getInstance();
rip.setHTTPService(new XhrHTTPService());
```

## API base url

The base url of your api must be defined with the `@BaseUrl` class decorator. 

```typescript
@BaseUrl('http://localhost:8080')
class UserClient {
  ...
}
```

## Request Declaration
Decorators on the class methods and its parameters indicate how a request will be handled.

### HTTP verb
Every method must have an HTTP verb decorator that provides the request method and relative URL.  
There are six built-in decorators: GET, POST, PUT, PATCH, DELETE, and HEAD.  
The relative URL of the resource is specified in the decorator.

```typescript
@GET('/things')
all() {
}
```

You can also specify query parameters in the URL.

```typescript
@GET('/things?sort=desc')
all() {
}
```
### Url manipulation

A request URL can be updated dynamically using replacement blocks and parameters on the method.  
A replacement block is an alphanumeric string starting with `:`.  
A corresponding parameter must be annotated with @Path using the same string (but without `:`).

```typescript
@GET('/user/:id')
getUser(@Path('id') id: number) {
}
```

Query parameters can also be added with the `@Query` decorator.

```typescript
@GET('/content/:category')
getContents(@Path('category') category: string, @Query('sort') sort: string) {
}
```
### Request body

A parameter can be specified for use as the HTTP request body with the `@Body` decorator.

```typescript
@POST('/users/new')
createUser(@Body user: User) {
}
```

This object can implement the `Serializable` interface and define the body of `serialize` method.

```typescript
class User implements Serializable {
  
  public name: string;
  
  public serialize(): string {
    return JSON.stringify(this);
  }
}
```

If not, this object will be serialized into a plain json object with the method JSON.stringify() or used as is if it's a scalar value (string, number, boolean) 

### Form url encoded and Multipart

Methods can also be declared to send form-encoded and multipart data.

Form-encoded data is sent when `@FormUrlEncoded` is present on the method. 
Each key-value pair is decorated with `@Field` containing the name and the object providing the value.

```typescript
@FormUrlEncoded
@POST('/user/edit')
updateUser(@Field("first_name") firstname: string, @Field("last_name") lastname: string) {
  
}
```

Multipart requests are used when `@Multipart` is present on the method.  
Parts are declared using the `@Part` decorator.

```typescript
@Multipart
@PUT('/user/photo')
updateUser(@Part('photo') photo: Photo, @Part('description') description: string) {

}
```

The parts can implement the `Serializable` interface and define the body of `serialize` method.
If not, the part will be serialized into a plain json object with the method JSON.stringify() or used as is if it's a scalar value (string, number, boolean) 

### Header manipulation

You can set static headers for a method using the `@Headers` annotation.

```typescript
@Headers([
  ['Cache-Control', 'max-age=640000']
])
@GET('/users')
all() {
  
}
```

*Note that headers do not overwrite each other. All headers with the same name will be included in the request.*

A request Header can be updated dynamically using the `@Header` decorator.  
A corresponding parameter must be provided to the `@Header`.  
If the value is null, the header will be omitted.  
Otherwise, toString will be called on the value, and the result used.

```typescript
@GET('/user')
getUser(@Header('Authorization') authorization: string) {
  
}
```

## Development

### Build

```bash
npm build
```

### Test

Tests are written with Jest.

```bash
npm test

# Or with code coverage
npm run coverage
```

In case of running test suite with Webstorm 2018.3.5,  
the error `Class constructor Spec cannot be invoked without 'new'` is thrown,

The workaround consist in disabling `jest.test.tree.use.jasmine.reporter` registry key:

- `Help | Find Action...` on the main menu;
- Type `registry` and click `Registry...` found element;
- Find `jest.test.tree.use.jasmine.reporter` key and disable it.

This bug has been fixed in 2019.1 version.

**cf. https://youtrack.jetbrains.com/issue/WEB-37680**

### Lint

```bash
npm run lint
```

## License
