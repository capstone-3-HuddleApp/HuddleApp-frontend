import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { login } from '../api/auth';
import FormField from '../components/FormField';

// Login validates far less than Signup, on purpose. Here we only check that
// the fields aren't EMPTY. We must NOT say a password "looks too short" —
// that would hand our password rules to someone guessing at an account that
// isn't theirs. Whether the credentials are actually right is a question only
// the server can answer.
const validateForm = (formFields) => {
  const errors = {};

  if (!formFields.identifier) {
    errors.identifier = 'Email or username is required';
  }

  if (!formFields.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

// setUser comes down from App, same as in Signup.
function Login({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithRedirect } = useAuth0(); // for the "Continue with Auth0" button

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // The backend looks `identifier` up against BOTH the email and the username
  // column, so this one box accepts either.
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  // If ProtectedRoute sent the user here, it stashed where they were headed.
  // Send them back there after login rather than dumping them on the home
  // page — they asked for /protected, they should land on /protected.
  const redirectTo = location.state?.from ?? '/protected';

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

    // Clear this field's error as soon as the user starts fixing it.
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    // Without this the browser does a full page reload and React never sees
    // the data. The #1 thing to remember about forms in React.
    event.preventDefault();

    const formErrors = validateForm(formData);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setIsLoading(true);

    try {
      // ---- the actual call to the backend ----
      // POST /auth/login with { identifier, password }. The server finds the
      // user, checks the password with bcrypt.compare, and if it matches
      // replies with a Set-Cookie header holding our JWT.
      //
      // Notice we never see, store, or pass the token around — the browser
      // holds it and attaches it to every later request for us.
      const loggedInUser = await login(formData);

      // Hand the user up to App so the Navbar and protected pages update.
      setUser(loggedInUser);

      navigate(redirectTo, { replace: true }); // replace: no "back" to the login page
    } catch (error) {
      // The server says only "Invalid email/username or password" — it won't
      // reveal whether the account exists. Show its message as-is.
      setErrors({ general: error.message });
    } finally {
      // Runs on success AND failure, so the button can't get stuck disabled.
      setIsLoading(false);
    }
  };

  return (
    <section className='mx-auto w-full max-w-md py-4 sm:py-8'> {/* 8/6/26 ET - added py-4 for smaller vertical padding on phones and sm:py-8 for larger padding on wider screens */}
      <div className='rounded-3xl border border-white/20 bg-[#211d30] p-6 shadow-2xl shadow-black/20 sm:p-8'> {/* 8/6/26 ET - added a dark-purple background, rounded corners, a subtle border, and a soft shadow around the login form */}
         {/*8/6/26 Removes the default margin and kept the default white color  */}
        <h1 className='m-0 text-3xl font-bold tracking-tight text-white'>
          Log in
        </h1>
        <p className='mt-2 mb-7 text-sm leading-6 text-[#aaa3bd]'> {/* 8/6/26 ET - added space around the description and uses softer text for contrast with the heading */}
          Welcome back. It's time to HUDL up.
        </p>

        {/*make login errors more readable*/}
        {errors.general && (
          <p
            role='alert'
            className='mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300'
          >
            {errors.general}
          </p>
        )}

        {/* noValidate turns OFF the browser's own popup validation, so our
            messages are the only ones the user sees. */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className='flex flex-col gap-4'
        >
          <FormField
            label='Email'
            name='identifier'
            placeholder='you@example.com'
            autoComplete='username'
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
          />

          <FormField
            label='Password'
            name='password'
            type='password'
            placeholder='••••••••'
            // "current-password" (not "new-password") tells a password manager
            // to autofill the saved one for this site.
            autoComplete='current-password'
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          {/* making the login button larger, more rounded, and easier to tap on mobile */}
          <button
            type='submit'
            disabled={isLoading}
            className='mt-2 min-h-12 rounded-xl bg-linear-to-r from-violet-600 to-purple-700 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
            >
            {isLoading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        {/* The OAuth alternative. Same destination, completely different route:
            Auth0 collects the credential and we never handle a password. */}
        <div className='my-6 flex items-center gap-3'>
          <span className='h-px flex-1 bg-white/10' />
          <span className='text-xs tracking-widest text-[#777087] uppercase'>or</span>
          <span className='h-px flex-1 bg-white/10' />
        </div>

        {/* Styles the Auth0 option as a secondary button so the main login action stays most prominent */}
        <button
          type='button'
          onClick={() => loginWithRedirect()}
          className='min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-[#d8d3e6] transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white'        >
          Continue with Auth0
        </button>

        {/* changed classname so that Log In text is purple and when hovering a link shows and turns violet to emphasize you are hovering it */}
        <p className='mt-6 text-center text-sm text-[#aaa3bd]'>
          Don't have an account?{' '}
          <Link
            to='/signup'
            className='font-semibold text-violet-400 transition hover:text-violet-300 hover:underline'          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
