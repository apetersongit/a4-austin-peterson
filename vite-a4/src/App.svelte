<script>
  import WatchlistForm from './components/WatchlistForm.svelte'
  import WatchlistTable from './components/WatchlistTable.svelte'

  const API_URL = window.location.port === '5173'
    ? 'http://localhost:3000'
    : ''

  let items = []

  let title = ''
  let type = ''
  let platform = ''

  let editingId = null

  const loadData = async function() {
    const response = await fetch(API_URL + '/data', {
      credentials: 'include'
    })

    if(!response.ok) {
      window.location.href = 'http://localhost:3000/login.html'
      return
    }

    items = await response.json()
  }

  const submit = async function(event) {

    const item = {
      title: event.detail.title,
      type: event.detail.type,
      platform: event.detail.platform
    }

    let response

    if(editingId === null) {
      response = await fetch(API_URL + '/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(item)
      })
    } else {
      response = await fetch(API_URL + '/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          id: editingId,
          item: item
        })
      })
    }

    if(!response.ok) {
      window.location.href = 'http://localhost:3000/login.html'
      return
    }

    items = await response.json()

    title = ''
    type = ''
    platform = ''
    editingId = null
  }

  const editItem = function(id) {
    const item = items.find(function(item) {
      return item._id === id
    })

    editingId = id

    title = item.title
    type = item.type
    platform = item.platform
  }

  const deleteItem = async function(id) {
    const response = await fetch(API_URL + '/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        id: id
      })
    })

    if(!response.ok) {
      window.location.href = '/login.html'
      return
    }

    items = await response.json()
  }

  loadData()
</script>

<div class="container">
  <header>
    <h1> Watchlist Maker </h1>
    <p>
      Add a movie or show and its streaming platform to your watchlist
    </p>
  </header>

  <main>
    <WatchlistForm
      bind:title={title}
      bind:type={type}
      bind:platform={platform}
      editing={editingId !== null}
      on:submit={submit}
    />

    <WatchlistTable
      items={items}
      editItem={editItem}
      deleteItem={deleteItem}
    />
  </main>
</div>