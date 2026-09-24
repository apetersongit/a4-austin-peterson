const loginForm = document.querySelector('#login-form')

loginForm.addEventListener('submit', async function(event) {
    event.preventDefault()

    const username = document.querySelector('#username').value
    const password = document.querySelector('#password').value

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username,
            password:password
        })
    })

    const data = await response.json()

    if(!response.ok) {
        document.querySelector('#login-message').textContent = data.error
        return
    }

    if(data.newUser) {
        alert('New account created')
    }

    window.location.href = '/'
})