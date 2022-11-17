# @apihero/js

## 1.3.7

### Patch Changes

- 075e0d3: Try to fix the @apihero/js exports

## 1.3.6

### Patch Changes

- 3853e5a: Remove default from exports

## 1.3.5

### Patch Changes

- a9bcb3b: Use legacy esm output to avoid mjs extensions

## 1.3.4

### Patch Changes

- 38335bc: Added the import property to the node export

## 1.3.3

### Patch Changes

- 5d425fc: Removed @apihero/constants-js internal package

## 1.3.2

### Patch Changes

- 7332423: Converted @apihero/constants-js to an internal package

## 1.3.1

### Patch Changes

- 41c71ed: Try fixing ERR_UNSUPPORTED_DIR_IMPORT error

## 1.3.0

### Minor Changes

- 68a0011: Add support for intercepting node native fetch calls

### Patch Changes

- dd6a9f2: Added a default proxy url so including the url is optional

## 1.2.0

### Minor Changes

- 8f3dd26: Add support for API Hero in Cloudflare Workers (or any other web-fetch environment)

### Patch Changes

- Updated dependencies [8f3dd26]
  - @apihero/interceptors-js@1.0.2

## 1.1.1

### Patch Changes

- 4af7924: Remove extra logging from the Service Worker

## 1.1.0

### Minor Changes

- ab75b66: Added support for proxying browser based requests using Service Workers

### Patch Changes

- ac04c52: Use host instead of hostname so we don't lose the port
- 234f2e4: Now able to proxy requests through local proxy to an https endpoint
- 4e29609: Added a payload to the request, that includes the environment
- 949545c: Initial beta release
- Updated dependencies [234f2e4]
- Updated dependencies [4e29609]
- Updated dependencies [949545c]
  - @apihero/interceptors-js@1.0.1
  - @apihero/constants-js@1.0.1
