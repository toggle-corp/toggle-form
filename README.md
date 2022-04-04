# Toggle Form

A simple form library using react hooks.
# Getting started
This page is an overview of the `Toggle Form` documentation and related resources. <br>
The library exposes three react hooks to define a form:
1. useForm
2. useArrayField
3. useObjectField


## Prerequisites
- [Node](https://nodejs.org/en/)
- Understanding of [TypeScript](https://www.typescriptlang.org/)

---

## Installation 
```
yarn install 

yarn add @togglecorp/toggle-form@beta 
```
---

## Table of Contents
  - [Quick start](#quick-start)
  - [useForm](#useform)
    - [setValue](#setvalue)
    - [setFieldValue](#setfieldvalue)
    - [setPristine](#setpristine)
    - [setError](#seterror)
  - [getObjectError](#getobjecterror)
  - [createSubmitHandler](#createsubmithandler)
  - [useFormArray](#useformarray)
  - [useFormObject](#useformobject)
  - [Schema](#schema)

---
## Note:

  In this documentation, we will be using the `RawInput` component instead of `input`.

  To set value for each field in the form, it requires `name`, `value` parameter whereas `input` return `event` comprise of name, value, and other props. So to maintain compatibility with toggle-form, the `input` component is customized as `RawInput`.

>*RawInput.tsx*
<details>
  <summary> show code </summary>

 ```typescript
import React from 'react';

export interface Props<N> extends Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'value' | 'name'> {
  className?: string;
  name: N;
  value: string | undefined | null;
  onChange?: (
    value: string | undefined,
    name: N,
    e?: React.FormEvent<HTMLInputElement> | undefined,
  ) => void;
  elementRef?: React.Ref<HTMLInputElement>;
}

function RawInput<N extends number | string | undefined>(props: Props<N>) {
  const {
    className,
    onChange,
    elementRef,
    value,
    name,
    ...otherProps
  } = props;

  const handleChange = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;

    if (onChange) {
      onChange(
        v === '' ? undefined : v,
        name,
        e,
      );
    }
  }, [name, onChange]);

  return (
    <input
      {...otherProps}
      ref={elementRef}
      name={String(name)}
      onChange={handleChange}
      value={value ?? ''}
    />
  );
}

export default RawInput;
```
</details>

---

## Quick start
  - `Toggle Form` takes care of the repetitive and annoying stuff and tracks:
      - value
      - error
      - visited field
      - validation
      - handling submission
  

  - The following code demonstrates a basic usage example:

>*FormExample.tsx*
```typescript
import React from 'react';
import {
  createSubmitHandler,
  getErrorObject,
  ObjectSchema,
  PartialForm,
  requiredCondition,
  useForm,
} from '@togglecorp/toggle-form';
import RawInput from '../components/RawInput';
import './styles.css';

type FormField = {
  name: string;
  gender: string;
  age: string;
}

type FormType = PartialForm<FormField>;
type FormSchema = ObjectSchema<PartialForm<FormType>>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
  fields: (): FormSchemaFields => ({
    name: [requiredCondition],
    gender: [requiredCondition],
    age: []
  }),
};

function FormExample() {
  const {
    value,
    error: riskyError,
    pristine,
    setFieldValue,
    validate,
    setError,
  } = useForm<PartialForm<FormType>>(
    schema,
    {
      value: {},
    },
  );
  const error = getErrorObject(riskyError);
  const handleSubmit = React.useCallback(() => {
    console.log('submit called');
  }, []);

  return (
    <form
      className='form-container'
      onSubmit={createSubmitHandler(validate, setError, handleSubmit)}>
      <RawInput
        label="Name"
        name='name'
        value={value?.name}
        onChange={setFieldValue}
        error={error?.name}
      />
      <RawInput
        label="Age"
        name='age'
        value={value?.age}
        onChange={setFieldValue}
        error={error?.age}
      />
      <RawInput
        label="Gender"
        name='gender'
        value={value?.gender}
        onChange={setFieldValue}
        error={error?.gender}
      />
      <div>
        <button
          type='submit'
          disabled={pristine}
        >
          Submit
        </button>
      </div>
    </form>
  )
}

export default FormExample;

```

## useForm
` useForm ` hook is used to control a form. It takes optional arguments, described below:

**The `useForm` hook accepts these options:**
| option   | description                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| schema   | The schema used to validate the form                                                                         |
| value    | The initial value for the form                                                                               |
| pristine | Returns false when the form gets spoilt. <br> helps to keep track with the user's interaction with the form. |
| error    | The error state of form.                                                                                     |

  ```typescript
  type FormInput = {
    userName?: string;
  };

  const {  } = useForm<FormInput>(
    schema,
    {
      value: {},
      pristine: initialPristine,
      error: initialError,
    },
  );
  ```

**The return value from useForm hooks are as follows:**
  | value    | description                             |
  | -------- | --------------------------------------- |
  | value    | The value of the form                   |
  | error    | The error state of the form             |
  | pristine | Defines the pristine state of the form. |

- ### setFieldValue
    setFieldValue is used to set the value of each input individually in a form.

  ``` typescript
  //setFieldValue('value', 'fieldName');
   setFieldValue('Test name', 'name' as const);
    <RawInput
      name='name'
      value={value.name
      onChange={setFieldValue}
    />
  ```
- ### setValue
  Each field is required to have a name as a key to set value process. <br>
  This is used to set the value for a group of input as it also   returns the old value. <br>
  Generally, the use case will be to mapped the data fetched from API according to the concern field. <br>

  ``` typescript
  const data = React.useMemo(() => ({
    name: 'test name',
    age: '25',
  }), []);

  React.useEffect(() => {
    setValue(data);
  }, [data, setValue]);

  // OR,
  //React.useEffect(() => {
  //  setValue({
  //    name: data.name,
  //  });
  //}, [data]);

  return (
    <RawInput
      name='name'
      value={value.name}
      onChange={setFieldValue}
    />
    <RawInput
      name='age'
      value={value.age}
      onChange={setFieldValue}
    />
  )

  ```

- ### setPristine
  Pristine is used to decide whether to disable form submission or not. Whenever any event occurs in the form it gets enabled and vice-versa.

  ``` typescript
    <form>
      <RawInput
        name='username'
        value={value.userName}
        onChange={setFieldValue}
      />
      <Button disabled={pristine}>
        submit
      </Button>
    </form>
  ```
  </details>

- ### setError
  This function is used to set one or more errors manually.
  Errors will return when validations fails.

### getObjectError
type conversion of errors as object.

```typescript
  const {
    error: riskyError,
  } = useForm(
    schema,
    {
      value:{},
    },
    );

  const error = getErrorObject(riskyError);
```

### createSubmitHandler
  `createSubmitHandler`is invoked on form submission. This function will receive the form data if the validation is successful. All the utility functions passed as parameters are used sequentially.

  ```typescript
    <form
      onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
      >
      // code block
    </form>
  ```

  | option       | description                               |
  | ------------ | ------------------------------------------|
  | validate     | used to check the truth value of the form. |
  | setError     | used to sets form error.                 |
  | handleSubmit | function used to submit form value. <br> handleSubmit will validate your inputs before invoking ` onSubmit ` |

  The form is only submitted if it passed the above validation or has sanitized value.

## useFormObject
  `useFormObject` is used to control an object. The useFormObject hook accepts options: 

  | option       | description                         |
  | ------------ | ----------------------------------- |
  | name         | name of the object field            |
  | onChange     | change handler of the object        |
  | defaultValue | default values for the object field |

  The return value from `useFormObject` is the change handler for the object fields.

>*FormObjectExample.tsx*
  <details>
    <summary>show code </summary>

  ```typescript
  import React from 'react';
import {
  createSubmitHandler,
  getErrorObject, ObjectSchema,
  SetValueArg,
  useForm,
  useFormObject,
  PartialForm,
  Error,
  requiredCondition,
} from '@togglecorp/toggle-form';
import RawInput from '../../components/RawInput';
import Button from '../../components/Button';


type FormType = {
  meta?: {
    name?: string;
    age?: string;
  };
  country?: string;
};
type BaseFormType = Omit<FormType, 'clientId'> & PartialForm<FormType>;
type FormSchema = ObjectSchema<BaseFormType, BaseFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
type MetaType = NonNullable<FormType['meta']>;
type MetaSchema = ObjectSchema<PartialForm<MetaType>, BaseFormType>;
type MetaSchemaFields = ReturnType<MetaSchema['fields']>;

const schema: FormSchema = {
  fields: (): FormSchemaFields => ({
    meta: {
      fields: (): MetaSchemaFields => ({
        name: [requiredCondition],
        age: [requiredCondition],
      }),
    },
    country: [],
  }),
};

type MetaInputValue = PartialForm<MetaType> | undefined;
interface MetaInputProps<K extends string | number> {
  name: K,
  value: MetaInputValue,
  error: Error<MetaType> | undefined;
  onChange: (value: SetValueArg<MetaInputValue> | undefined, name: K) => void;
}

function MetaInput<K extends string | number>(props: MetaInputProps<K>) {
  const {
    name,
    value,
    error: riskyError,
    onChange,

  } = props;
  const onFieldChange = useFormObject(name, onChange, {});
  const error = getErrorObject(riskyError);

  return (
    <>
      <RawInput
        label="Name"
        name="name"
        value={value?.name}
        onChange={onFieldChange}
        error={error?.name}
      />
      <RawInput
        label="Age"
        name="age"
        value={value?.age}
        onChange={onFieldChange}
        error={error?.age}
      />
    </>
  );
}

function FormObjectExample() {
  const {
    pristine,
    value,
    error: riskyError,
    setFieldValue,
    validate,
    setError,
    setValue,
  } = useForm<PartialForm<FormType>>(
    schema,
    {
      value: {},
      pristine: true,
    },
  );
  const error = getErrorObject(riskyError);
  const handleSubmit = React.useCallback(
    (finalValues: PartialForm<FormType>) => {
      setValue(finalValues);
    }, [setValue],
  );

  return (
    <form
      onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
    >
      <MetaInput
        name='meta'
        value={value.meta}
        onChange={setFieldValue}
        error={error?.meta}
      />
      <RawInput
        label='Country'
        name='country'
        value={value.country}
        onChange={setFieldValue}
        error={error?.country} />
      <Button
        name={undefined}
        type="submit"
        disabled={pristine}
      >
        Submit
      </Button>
    </form>
  );
}

export default FormObjectExample;
```
  </details>

  ## useFormArray
  `useFormArray` hook is used to control an array. The 
  useFormArray hook accepts these options:

  | option   | description                 |
  | -------- | ----------------------------|
  | name     | name of the array field     |
  | onChange | change handler of the array |

  The return value from useFormArray are as follows:

  | value       | description                            |
  | ----------- | -------------------------------------- |
  | setValue    | the change handler for the array items |
  | removeValue | the delete handler for the array items |

>*FormArrayExample.tsx*
<details>
  <summary> show code </summary>

  ```typescript
  import React from 'react';
import {
  ArraySchema,
  ObjectSchema,
  PartialForm as RawPartialForm,
  SetValueArg,
  useForm,
  Error,
  useFormObject,
  getErrorObject,
  useFormArray,
  createSubmitHandler,
} from '@togglecorp/toggle-form';
import RawInput from '../../components/RawInput';
import Button from '../../components/Button';

type PartialForm<T> = RawPartialForm<T, 'clientId'>;

interface FormType {
  userList?: {
    clientId: string | number;
    name?: string;
    age?: string;
    gender?: string;
  }[]
}

type BaseFormType = PartialForm<FormType>;
type FormSchema = ObjectSchema<FormType, BaseFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type UserType = NonNullable<NonNullable<FormType['userList']>>[number];
type UserSchema = ObjectSchema<PartialForm<UserType>, BaseFormType>;
type UserSchemaFields = ReturnType<UserSchema['fields']>;
type UserListsSchema = ArraySchema<PartialForm<UserType>, BaseFormType>;
type UserListsSchemaMember = ReturnType<UserListsSchema['member']>;

const schema: FormSchema = {
  fields: (): FormSchemaFields => ({
    userList: {
      keySelector: (c) => c.clientId,
      member: (): UserListsSchemaMember => ({
        fields: (): UserSchemaFields => ({
          clientId: [],
          name: [],
          age: [],
          gender: [],
        }),
      }),
    },
  }),
};

interface UserInputProps {
  value: PartialForm<UserType>,
  error: Error<UserType> | undefined;
  onChange: (value: SetValueArg<PartialForm<UserType>>, index: number) => void;
  onRemove: (index: number, e: React.MouseEvent<HTMLButtonElement>) => void;
  index: number,
}

const defaultUserValues: PartialForm<UserType> = {
  clientId: 'test',
};
const defaultFormValues: PartialForm<FormType> = {};

function UserCollectionInput(props: UserInputProps) {
  const {
    value,
    error: riskyError,
    onChange,
    onRemove,
    index,
  } = props;

  const onFieldChange = useFormObject(index, onChange, defaultUserValues);

  const error = getErrorObject(riskyError);

  return (
    <div>
      <Button
        name={index}
        onClick={onRemove}
      >
        x
      </Button>
      <RawInput
        label="Name"
        name="name"
        value={value.name}
        onChange={onFieldChange}
        error={error?.name}
      />
      <RawInput
        label="Age"
        name="age"
        value={value.age}
        onChange={onFieldChange}
        error={error?.age}
      />
      <RawInput
        label="Gender"
        name="gender"
        value={value.gender}
        onChange={onFieldChange}
        error={error?.gender}
      />
    </div>
  );
}

function FormArrayExample() {
  const {
    value,
    error: riskyError,
    setFieldValue,
    validate,
    setError,
    setValue,
  } = useForm(
    schema,
    {
      value: defaultFormValues,
    },
  );

  const handleSubmit = React.useCallback(
    (finalValues: PartialForm<FormType>) => {
      setValue(finalValues);
    }, [setValue],
  );

  const error = getErrorObject(riskyError);
  const arrayError = getErrorObject(error?.userList);

  type UserCollections = typeof value.userList;
  const {
    setValue: onCollectionChange,
    removeValue: onCollectionRemove,
  } = useFormArray('userList', setFieldValue);

  const handleCollectionAdd = React.useCallback(
    () => {
      const clientId = Math.random();
      const newCollection: PartialForm<UserType> = {
        clientId,
      };
      setFieldValue(
        (oldValue: PartialForm<UserCollections>) => (
          [...(oldValue ?? []), newCollection]
        ),
        'userList' as const,
      );
    },
    [setFieldValue],
  );

  return (
    <div>
      <form onSubmit={createSubmitHandler(validate, setError, handleSubmit)}>
        <Button
          name={undefined}
          onClick={handleCollectionAdd}
        >
          Add user
        </Button>
        {value.userList?.length ? (
          value.userList.map((users, index) => (
            <UserCollectionInput
              key={users.clientId}
              index={index}
              value={users}
              onChange={onCollectionChange}
              onRemove={onCollectionRemove}
              error={arrayError?.[users.clientId]}
            />
          ))
        ) : (
          <div>No user found</div>
        )}
      </form>
    </div>
  );
}
export default FormArrayExample;

  ```
</details>

## Schema 
The schema defines to the structure of the form. The schema can defined for the objects, arrays and literals. We also provides schema-based validation and you can also use your custom validation function.
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

### Validation Function
It will validate your input data against the schema and return with either errors or a valid result.
The library provides these validations functions:

- requiredCondition
- requiredStringCondition
- requiredListCondition
- backlistCondition
- whitelistCondition
- lengthGreaterThanCondition
- lengthSmallerThanCondition
- greaterThanCondition
- smallerThanCondition
- greaterThanOrEqualToCondition
- integerCondition
- emailCondition
- urlCondition
  
  You can also add your custom validation function:
  ```typescript
    export function max10CharCondition(value: any) {
    return (value) && value.length > 10
      ? 'only 10 characters are allowed'
      : undefined;
  }
  ```

---