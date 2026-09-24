<script>
  export let items = []

  export let editItem
  export let deleteItem
</script>

<section>
  <h2>Results</h2>

  <table>
    <thead>
      <tr>
        <th> Title </th>
        <th> Type </th>
        <th> Platform </th>
        <th> Date Added </th>
        <th> Edit </th>
      </tr>
    </thead>

    <tbody>
      {#each items as item}
        <tr>
          <td>{item.title}</td>
          <td>{item.type}</td>
          <td>{item.platform}</td>
          <td>{item.dateAdded}</td>
          <td>
            <button onclick={() => editItem(item._id)}>Edit</button>
            <button onclick={() => deleteItem(item._id)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>