# `@repo/http`

Provider-neutral typed HTTP client with a normalized `HttpError`. Replace the fetch implementation at the application boundary when your app needs authentication, tracing, or a different transport.

JSON mutations preserve object, tuple-list and Headers inputs, including explicit content types. Request timeout handles and caller cancellation listeners are disposed after the response body is parsed or the request fails; caller cancellation continues to affect requests while they are in flight.
