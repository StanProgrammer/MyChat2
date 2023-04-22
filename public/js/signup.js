// Get the form element and input fields
const myform = document.getElementById('my-form')
const name = document.getElementById('name')
const email = document.getElementById('email')
const phone = document.getElementById('phone')
const password = document.getElementById('password')

// Add a submit event listener to the form
myform.addEventListener('submit', async (e) => {
  try {
    // Prevent the default form submission behavior
    e.preventDefault()

    // Validate the form inputs
    if (!name.value || !email.value || !phone.value || !password.value) {
      throw new Error('Please fill out all form fields.')
    }

    if (!isValidEmail(email.value)) {
      throw new Error('Please enter a valid email address.')
    }

    if (!isValidPhoneNumber(phone.value)) {
      throw new Error('Please enter a valid phone number.')
    }

    if (!isValidPassword(password.value)) {
      throw new Error('Password must be at least 8 characters long and contain at least one letter and one number')
    }

    // If the inputs are valid, create an object with the form data
    const myObj = {
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value
    }

    // Make a POST request to the server
    const post1 = await axios.post('http://localhost:3000/signup', myObj)

    // Display a success message and redirect the user
    alert('Successfull')
    window.location.href = 'http://localhost:3000/views/login.html'
  } catch (error) {
    // Display an error message if the request fails
    if (error.response && error.response.status === 400) {
      alert('User Already Exists')
      location.reload()
    } else {
      alert(error.message)
    }
  }
})

// Helper function to validate email addresses
function isValidEmail(email) {
  // This regex pattern matches most valid email addresses
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Helper function to validate phone numbers
function isValidPhoneNumber(phone) {
  // This regex pattern matches US phone numbers in various formats
  const regex = /^(\+1)?\s*([0-9]{3}|\([0-9]{3}\))[-.\s]*[0-9]{3}[-.\s]*[0-9]{4}$/
  return regex.test(phone)
}

// Helper function to validate passwords
function isValidPassword(password) {
  // Password must be at least 8 characters long and contain at least one letter and one number
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  return regex.test(password)
}
