# Toggle Form

A simple form library using react hooks

## Features

- Reasonably typesafe
- Powerful validation
- Supports nested forms
- Supports conditional fields
- Supports automatic dependency tracking
- Supports restore point

## API

The library exposes three react hooks to define a form.

1. useForm
2. useFormArray
3. useFormObject

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
|member|Function that defines the schema for each item of the array|
|keySelector|Function that defines the unique key for each item of the array|

### Literal Schema

The literal schema is an object with these properties:

|property|description|
|----|----|
|required|If defined, the literal will be required|
|requiredValidation|If defined, this function will be used to check required condition|
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

## Helper Functions

### getErrorObject

Function to convert leaf error to object error

### getErrorString

Function to convert object error or array error to string error

### removeNull

Function to recursively remove `null` values from an object

### createSubmitHandler

Predefined function to define submit handler for html form

|argument|description|
|----|----|
|validator|Function to trigger form validation|
|setError|Function to set form error|
|successCallback|Callback for validation success|
|failureCallback|Callback for validation failure|

The return value is the function that can be passed to form `onSubmit` prop

### addCondition

Predefined function to add conditions on schema fields

|argument|description|
|----|----|
|schema|Fields of the object schema|
|value|Value of the object|
|dependentKeys|Keys of the object that are used to define the condition|
|valueKeys|Keys of the object that are affected by the condition|

The return value is the updated fields of the object schema

## Core Functions

### accumulateValues

Function to get validated value from form value and form schema

### accumulateErrors

Function to get form error from form value and form schema

### accumulateDifferentialErrors

Function to get differential form error from form value and form schema

### analyzeErrors

Function to identify if form has errored from the form error

## Symbols

### nonFieldError

Symbol to access non field error on errors returned by `useForm`

### fieldDependencies

Symbol to define field dependencies on object schema

### undefinedValue

Symbol to define `undefined` on `forceValue` and `defaultValue` on literal schema

### nullValue

Symbol to define `null` on `forceValue` and `defaultValue` on literal schema

## Development

```bash
# Install dependencies
yarn install
```

### Lib

```bash
cd lib

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

# Start storybook
yarn storybook
```
