import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { signup } from '../api/auth';
import FormField from '../components/FormField';

// Validation lives OUTSIDE the component: it takes the form fields and returns
// an errors object. It touches no state and no props, so you can read it — and
// test it — on its own. An empty object back means "everything is fine".
//
// This is a convenience for the user, NOT security. The backend runs its own
// checks, because anyone can skip this form and POST straight to the API.
const validateForm = (formFields) => {
  const errors = {};

  if (!formFields.username) {
    errors.username = 'Username is required';
  } else if (
    formFields.username.length < 3 ||
    formFields.username.length > 20
  ) {
    errors.username = 'Username must be between 3 and 20 characters';
  }

  if (!formFields.email) {
    errors.email = 'Email is required';
  } else if (!formFields.email.includes('@')) {
    errors.email = 'Enter a valid email address';
  }

  if (!formFields.password) {
    errors.password = 'Password is required';
  } else if (formFields.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

// setUser comes down from App. After a successful signup we call it so App —
// and therefore the Navbar and every protected page — knows who just logged in.
function Signup({ setUser }) {
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0(); // for the "Continue with Auth0" button

  // Errors start empty — nothing is wrong with a form nobody has touched yet.
  // Each key matches an input's `name`, which is what lets handleChange and
  // FormField find the right error without a separate variable per field.
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // ONE handler for all three inputs. Every input has a `name` matching a key
  // in formData, so [name]: value updates whichever field changed.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

    // Clear this field's error as soon as the user starts fixing it — leaving
    // it up while they type feels like the form is nagging them.
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    // Without this the browser does a full page reload on submit and React
    // never sees the data. The #1 thing to remember about forms in React.
    event.preventDefault();

    const formErrors = validateForm(formData);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setIsLoading(true);

    try {
      // ---- the actual call to the backend ----
      // POST /auth/signup with { username, email, password }.
      // The server hashes the password with bcrypt, saves the user, and
      // replies with a Set-Cookie header holding our JWT. By the time this
      // line finishes, the browser is already holding the login cookie.
      const newUser = await signup(formData);

      // Hand the new user up to App so the rest of the UI updates.
      setUser(newUser);

      navigate('/'); // straight into the app — no second login step
    } catch (error) {
      // Anything the server rejected — "email already exists", "username
      // taken" — or the network being down. `general` isn't a field name, so
      // it renders in the banner above the form rather than under an input.
      setErrors({ general: error.message });
    } finally {
      // Runs on success AND failure, so the button can never get stuck in its
      // disabled "Creating account…" state.
      setIsLoading(false);
    }
  };

  return (
    <section className='mx-auto w-full max-w-md py-4 sm:py-8'>   {/* 8/6/26 ET - added py-4 for smaller vertical padding on phones and sm:py-8 for larger padding on wider screens */}

      <div className='rounded-3xl border border-[#f4c96b] bg-[#f8d8aa] p-6 shadow-2xl shadow-[#b39588]/20 sm:p-8'> {/* 8/6/26 ET - added a dark-purple background, rounded corners, a subtle border, and a soft shadow around the signup form */}
         {/*8/6/26 Removes the default margin and kept the default white color  */}
        <h1 className='m-0 text-3xl font-bold tracking-tight text-[#29272b]'>
          Sign Up
        </h1>

        <p className='mt-2 mb-7 text-sm leading-6 text-[#7d8794]'> {/* 8/6/26 ET - added space around the description and uses softer text for contrast with the heading */}
          Create an account to find and join local events.</p> {/* 8/6/26 ET - changed the text to better fit project */}

        {/*make signup errors more readable*/}
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
            label='Username'
            name='username'
            placeholder='ada_lovelace'
            autoComplete='username'
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />

          <FormField
            label='Email'
            name='email'
            type='email'
            placeholder='you@example.com'
            autoComplete='email'
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            label='Password'
            name='password'
            type='password'
            placeholder='••••••••'
            // Tells a password manager to offer a GENERATED password here
            // rather than autofilling an existing one.
            autoComplete='new-password'
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          {/* making the signup button larger, more rounded, and easier to tap on mobile */}
          <button
            type='submit'
            disabled={isLoading}
            className='mt-2 min-h-12 rounded-xl border border-[#d18a32] bg-linear-to-r from-[#ffe991] to-[#f4c96b] px-4 py-3 font-semibold text-[#29272b] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
            >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* The OAuth alternative. Same destination, completely different route:
            Auth0 collects the credential and we never handle a password. */}
        <div className='my-6 flex items-center gap-3'>
          <span className='h-px flex-1 bg-[#b39588]/30' />
          <span className='text-xs tracking-widest text-[#7d8794] uppercase'>or</span>
          <span className='h-px flex-1 bg-[#b39588]/30' />
        </div>

        {/* Styles the Auth0 option as a secondary button so the main signup action stays most prominent */}
        <button
          type='button'
          onClick={() => loginWithRedirect()}
          className='min-h-12 w-full rounded-xl border border-[#b39588] bg-[#fff9df] px-4 py-3 font-semibold text-[#29272b] transition hover:border-[#d18a32] hover:bg-[#fff3c7] hover:text-[#29272b]'        >
          Continue with Auth0
        </button>

        {/* changed classname so that Log In text is purple and when hovering a link shows and turns violet to emphasize you are hovering it */}
        <p className='mt-6 text-center text-sm text-[#7d8794]'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='font-semibold text-[#f2a451] transition hover:text-[#e8943e] hover:underline'          >
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;
