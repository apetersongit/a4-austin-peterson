// FRONT-END (CLIENT) JAVASCRIPT HERE

let currentData = []
let editingId = null

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const title = document.querySelector('#title').value
  const type = document.querySelector('#type').value
  const platform = document.querySelector('#platform').value

  const item = {
    title: title,
    type: type,
    platform: platform
  }

  let response
  
  if(editingId === null) {
    response = await fetch( '/submit', {
    method:'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
  } else {
    response = await fetch('/edit', {
      method:'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: editingId, item: item
      })
    })
  }

  const data = await response.json()

  console.log('Updated data: ', data)

  document.querySelector('#watchlist-form').reset()

  editingId = null
  
  document.querySelector('#watchlist-form button').textContent = 'Submit'

  displayData(data)
}

const displayData = function(data) {
  currentData = data

  const tableBody = document.querySelector('#watchlist-body')

  tableBody.innerHTML = ''

  for(let i = 0; i < data.length; i++) {
    const item = data[i]
    const row = document.createElement('tr')

    row.innerHTML = `
      <td>${item.title}</td>
      <td>${item.type}</td>
      <td>${item.platform}</td>
      <td>${item.dateAdded}</td>
      <td>
        <button onclick="editItem('${item._id}')"> Edit </button>
        <button onclick="deleteItem('${item._id}')"> Delete </button>
      </td>
    `

    tableBody.appendChild(row)
  }
}

const editItem = function(id) {
  editingId = id

  const item = currentData.find(function(item){
    return item._id === id
  })

  document.querySelector('#title').value = item.title
  document.querySelector('#type').value = item.type
  document.querySelector('#platform').value = item.platform

  document.querySelector('#watchlist-form button').textContent = 'Update'
}

const deleteItem = async function(id) {
  const response = await fetch('/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({id: id})
  })

  if(!response.ok) {
    window.location.href = '/login.html'
    return
  }

  const data = await response.json()

  displayData(data)
}

const loadData = async function() {
  const response = await fetch('/data')

  if(!response.ok) {
    window.location.href = '/login.html'
    return
  }

  const data = await response.json()
  displayData(data)
}

window.onload = function() {
  const form = document.querySelector('#watchlist-form')
  form.onsubmit = submit

  const logoutButton = document.querySelector('#logout-button')

  logoutButton.addEventListener('click', async function() {
    await fetch('/logout', {
      method: 'POST'
    })

    window.location.href = '/login.html'
  })

  loadData()
}
