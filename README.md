# Toggle Form

A simple form library using react hooks


## Features

- Powerful validation
- Supports nested forms
- Supports conditional fields
- Reasonably typesafe

## Introduction

The library exposes three react hooks to define a form.

1. useForm
2. useArrayField
3. useObjectField

### useForm

`useForm` hook is used to control a form.
The `useForm` hook accepts these options:

|option|description|
|----|----|
|value|The initial value for the form|
|schema|The schema used to validate the form|

The return value from `useForm` hooks are as follows:

|value|description|
|----|----|
|value|The value of the form|
|error|The error state of the form|
|pristine|The pristine state of the form|
|pristine|Defines if the form is pristine|
|validate|If there are errors, sets form error else returns sanitized value|
|onPristineSet|Function to set form's pristine state|
|onErrorSet|Function to set form's error state|
|onValueSet|Function to set form's value, error is cleared and pristine is set to true|
|onValueChange|Function to set form field's value and pristine is set to false|

### useFormObject

`useFormObject` hook is used to control an object.
The `useFormObject` hook accepts these options:

|option|description|
|----|----|
|name|name of the object field|
|onChange| change handler of the object|
|defaultValue|default value for the object|

The return value from `useFormObject` is the change handler for the object
fields.

### useFormArray

`useFormArray` hook is used to control an array.
The `useFormArray` hook accepts these options:

|option|description|
|----|----|
|name|name of the array field|
|onChange| change handler of the array|

The return value from `useFormArray` are as follows:

|value|description|
|----|----|
|onValueChange|The change handler for the array items.|
|onValueRemove|The delete handler for the array items.|

### Schema

The schema defines the structure of the form.
The schema can defined for objects, arrays and literals.

### Object Schema

The schema object is an object with these properties:

|property|description|
|----|----|
|validation|Function to validate the object|
|fields|Function that defines the schema for each key of the object|
|fieldDependencies|Function that defines the dependency between object keys|

### Array Schema

The array schema is an object with these properties:

|property|description|
|----|----|
|validation|Function to validate the array|
|members|Function that defines the schema for each item of the array|
|keySelector|Function that defines the unique key for each item of the array|

### Literal Schema

The literal schema is an array of validation functions.
The validation function accepts the current value and the overall form value.
The validation function can either return a string or undefined; the string
return value is interpreted as an error.

> ⚠ These validation functions can also be used for objects and arrays. But, it's
> better to use it for literals to keep the inferred typings correct.

There are built in validation functions for required condition, email
condition, url condition, greater than condition, less than condition and many
more.

#### Special validation functions

##### nonNullType

The form sets `null` to indicate there is no information. On special cases, we
would want to set `undefined` instead of `null`. We can use `nonNullType` to
get that behavior.

##### nullType

Sometimes we would want to clear value for certain fields. We can use
`nullType` to conditionally clear values.

##### ⚠ arrayType

For array type, we should add `arrayType` so that the typings for error and the
actual error value will match.

##### ⚠ nonNullArrayType

For array type, we would want to set `[]` to indicate there is no information.
We can use `nonNullArrayType` to get that behavior.


## Development

### Running

```bash
# Install dependencies
yarn install

# Start storybook
yarn storybook
```

### Linting

```bash
# Eslint
yarn lint

# Typescript
yarn typecheck
```

