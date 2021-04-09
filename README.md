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

## Todo

- [ ] Document special case for uuid
    - If items do have a uuid field, it should be a required string.
- [ ] Document special case for id
    - For all other fields except id, the form sets null to indicate no information.
    - For id, the form sets undefined to indicate no information.
- [ ] Document special case for array
    - For all arrays, the form sets [] to indicate no information.
