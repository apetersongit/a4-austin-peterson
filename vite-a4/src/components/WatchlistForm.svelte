<script>
  import { createEventDispatcher } from 'svelte'

  export let title = ''
  export let type = ''
  export let platform = ''
  export let editing = false

  const dispatch = createEventDispatcher()

  const submitForm = function(event) {
    event.preventDefault()

    dispatch('submit', {
      title: title,
      type: type,
      platform: platform
    })
  }
</script>

<section>
  <h2>{editing ? 'Edit Watchlist Item' : 'Add to Watchlist'}</h2>

  <form onsubmit={submitForm}>
    <label for="title">Title</label>
    <input id="title" type="text" bind:value={title} required>

    <label for="type"> Film or Show </label>
    <select id="type" bind:value={type} required>
      <option value=""> Film or Show? </option>
      <option value="Film"> Film </option>
      <option value="Show"> Show </option>
    </select>

    <label for="platform"> Streaming Platform </label>
    <select id="platform" bind:value={platform} required>
      <option value=""> What streaming platform? </option>
      <option value="HBOMax"> HBOMax </option>
      <option value="Netflix"> Netflix </option>
      <option value="Hulu"> Hulu </option>
      <option value="Disney+"> Disney+ </option>
      <option value="Prime"> Prime </option>
      <option value="Peacock"> Peacock </option>
      <option value="Paramount+"> Paramount+ </option>
      <option value="AppleTV"> AppleTV </option>
      <option value="YouTube"> YouTube </option>
      <option value="Other"> Other </option>
    </select>

    <button type="submit">
      {editing ? 'Update' : 'Submit'}
    </button>
  </form>
</section>