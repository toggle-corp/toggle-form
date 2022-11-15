# Toggle Form

A simple form library using react hooks


## Features

- Reasonably typesafe
- Powerful validation
- Supports nested forms
- Supports conditional fields
- Supports automatic dependency tracking
- Supports restore point

## Introduction

The library exposes three react hooks to define a form.

1. useForm
2. useArrayField
3. useObjectField

### useForm

`useForm` hook is used to control a form.
The `useForm` hook accepts these arguments:

|argument|description|
|----|----|
|schema|The schema used to validate the form|
|initialState|The initial state for the form|
|context|The external context for form|

The return value from `useForm` hooks are as follows:

|value|description|
|----|----|
|value|The value of the form|
|error|The error state of the form|
|pristine|True if the form is pristine|
|setPristine|Defines if the form is pristine|
|validate|If there are errors, sets form error else returns sanitized value|
|setPristine|Function to set form's pristine state|
|setError|Function to set form's error state|
|setValue|Function to set form's value, error is cleared and pristine is set to true|
|setFieldValue|Function to set form field's value and pristine is set to false|
|hasRestorePoint|True if there is a restore point|
|restorePointValue|Value of the form when restore point was created|
|restorePointError|Error of the form when restore point was created|
|restorePointPristine|Pristine stateof the form when restore point was created|
|createRestorePoint|Function to create restore point|
|restore|Function to restore state to last restore point|
|clearRestorePoint|Function to clear last restore point|

### useFormObject

`useFormObject` hook is used to control an object.
The `useFormObject` hook accepts these arguments:

|argument|description|
|----|----|
|name|name of the object field|
|onChange| change handler of the object|
|defaultValue|default value for the object|

The return value from `useFormObject` is the change handler for the object
fields.

### useFormArray

`useFormArray` hook is used to control an array.
The `useFormArray` hook accepts these arguments:

|argument|description|
|----|----|
|name|name of the array field|
|onChange| change handler of the array|

The return value from `useFormArray` are as follows:

|value|description|
|----|----|
|setValue|The change handler for the array items.|
|removeValue|The delete handler for the array items.|

### Schema

The schema defines the structure of the form.
The schema can defined for objects, arrays and literals.

### Object Schema

The schema object is an object with these properties:

|property|description|
|----|----|
|validation|Function to validate the object|
|fields|Function that defines the schema for each key of the object|

### Array Schema

The array schema is an object with these properties:

|property|description|
|----|----|
|validation|Function to validate the array|
|members|Function that defines the schema for each item of the array|
|keySelector|Function that defines the unique key for each item of the array|

### Literal Schema

The literal schema is an object with these properties:

|property|description|
|----|----|
|required|If defined, the literal will be required|
|requiredCondition|If defined, this function will be used to check required condition|
|defaultValue|If defined, the literal value will fallback to this value|
|forceValue|If defined, the literal value will always be this value|
|validations|Array of functions to validate the literal|

### Validation functions

The library provides these validation function:

- requiredCondition
- requiredStringCondition
- requiredListCondition
- blacklistCondition
- whitelistCondition
- lengthGreaterThanCondition
- lengthSmallerThanCondition
- greaterThanCondition
- smallerThanCondition
- greaterThanOrEqualToCondition
- lessThanOrEqualToCondition
- integerCondition
- emailCondition
- urlCondition

#### Symbols

##### nonFieldError

Symbol to access non field error on errors returned by `useForm`

##### fieldDependencies

Symbol to define field dependencies on object schema

##### undefinedValue

Symbol to define `undefined` on `forceValue` and `defaultValue` on literal schema

##### nullValue

Symbol to define `null` on `forceValue` and `defaultValue` on literal schema

## Development

### Library

```bash
cd lib

# Install dependencies
yarn install

# Eslint
yarn lint

# Typescript
yarn typecheck

# Check unused files
yarn check-unused

# Test
yarn test
```

### Storybook

```bash
cd storybook

# Install dependencies
yarn install

# Start storybook
yarn storybook
```

