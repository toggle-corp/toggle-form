# Toggle Form

React form library by Togglecorp

## Get Started

```bash
# Install dependencies
yarn install

# Start storybook
yarn storybook
```

## Linting

```bash
# Eslint
yarn lint

# Typescript
yarn typecheck
```

## Special Cases

### idCondition

For all fields, the form sets `null` to indicate there is no information.
On special cases, we would want to set `undefined` to indicate there is no information.
We can use `idCondition` to alter that behavior.

### arrayCondition

For all fields, the form sets `null` to indicate there is no information.
For array type, we would want to set `[]` to indicate there is no information.
We can use `arrayCondition` to alter that behavior.

> `arrayCondition` also alters type of error generated

### nullCondition

Sometimes we would want to clear value for certain fields.
We can use `nullCondition` to conditionally clear values.
