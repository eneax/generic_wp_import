# WP XML Parse

Intructions:

1. Download your WordPress archive as an `XML` file.
2. Create a `/data` folder
3. Add the `XML` file to the newly created `/data` folder as `data.xml`
4. Create a `.env` file with `cp .env.sample .env`
5. Get your API ID (the hash in your GraphCMS Endpoint) and add it to your `.env` file as `API`.
6. Create an Auth token with permission to mutate content and add it to your `.env` as `GRAPHCMS_PAT`.
7. Formulate your mutation based on the following example:

```graphql
mutation CreatePost($title: String!) {
  createPost(data: { title: $title }) {
    title
  }
}
```

7. `npm run parse` - this will create a paired down `JSON` file to work with.
8. `npm run once` will run the script a single time for parsing the content. 
9. `npm run dev` will run the script in "watch mode" to check for changes.
