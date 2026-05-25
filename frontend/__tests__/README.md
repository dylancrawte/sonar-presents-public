# Tests 

## Auth feature

### auth-layout-test
for testing redirect , based on users authentication state

clerk & expo router are first mocked 

1 - simulates fully loaded, signed in user (main test). Component should render <Redirect> pointing to /(index). 
2 - Simulates loading state, to ensure component does not render anything
3 - Simulates a loaded but not authenticated user, to ensure /(auth) tabs are rendered
4 - Ensures navigation of (auth) tabs is corect for loaded but signed out user


### sign-in-test
Validates sign in screen

Mocks 4 functions, to track calls to Clerk and router
1 -signIn.create()
2- setActive()
3/4 - Router replace & push

UI components mocked 

1 - ui test for email and password text inputs
2 - ui test for sign in button disables when text fields empty 
3 - opposite of test 2 (probs overkill for initial testing)
4 - happy path; mocks signIn.create() to return { status: 'complete', createdSessionId: 'sess_abc' }, verifying chain with redirect to (index) at end
5 - edge case, that there is no navigation or setActive = true, if clerk returns a non-complete status
6 - mocks signIn.create to reject with clerk error, verifying component catches error gracefully (covers scenarios like invalid credentials & network failures)
7 - navigates to sign up when button pressed
8 - navigates to reset password page

*** might need to test reset password logic? ***


### sign-out-test
Lots of mocks, as currently the sign out logic is embedded into HomeScreen component

Mocked functions:
1 - signOut() from clerk
2 - router.replace()

All other mocks isolate sign out behaviour from rest of homeScreen.

1 - renders sign out button
2 - core sign out test, calls signOut and navigates to /(auth)
3 - verifies ordering of handleSignOutFunction. 


## Liked song feature
TODO: write documentation for these tests
