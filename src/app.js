require("dotenv").config();

const fs = require("fs").promises;
const fetch = require("isomorphic-unfetch");
const {
  proMark,
  pickConstructor,
  isHTML,
  attrConstructor,
} = require("./utils");

const run = async () => {
  const file = await fs.readFile("./data/data.json");
  const data = JSON.parse(file);
  const pick = pickConstructor(data);
  const items = pick("item", false);
  const posts = items.filter((item) => item["wp:post_type"][0] === "post");
  const publishedPosts = posts.filter(
    (post) => post["wp:status"][0] === "publish"
  );

  for (let post of publishedPosts) {
    const attr = attrConstructor(post);
    const payload = {};

    payload.status = attr("wp:status");
    [payload.date, payload.time] = attr("wp:post_date").split(" ");
    payload.title = attr("title").trim();
    payload.slug = attr("wp:post_name");
    payload.author = attr("dc:creator");

    payload.categories = attr("category", true)
      ? [
          ...new Set(
            attr("category", true)
              .map((category) => category._)
              .filter((category) => category != null)
          ),
        ]
      : [];

    const content = attr("content:encoded");
    const strippedContent = content.replace(/<!-{2}\s.+?-{2}>\n/gi, "");

    if (isHTML(strippedContent)) {
      payload.content = proMark(strippedContent);
    } else {
      payload.content = strippedContent;
    }

    payload.content = payload.content.replace("<br>", /\n\n/);
    payload.content = payload.content.replace("<hr>", "***");
    payload.content = payload.content.replace(/<\/?[a-z][\s\S]*>/gi, proMark);

    console.log("======== PAYLOAD =========", payload);

    const mutation = `
      mutation CreatePost(
        $title: String!, 
        $slug: String!, 
        $date: Date!, 
        $content: RichTextAST!, 
        $categories: [String!]!,
        $author: String!,
      ) {
        createPost(
          data: {
            title: $title, 
            slug: $slug, 
            date: $date, 
            content: {
              children: [
                {
                  type: "paragraph", 
                  children: [
                    {
                      text: $content
                    }
                  ]
                }
              ]
            }, 
            categories: $categories,
            author: $author,
          }
        ) {
          title
          slug
          date
          content {
            html
            markdown
            text
            raw
          }
          categories
          author
        }
      }    
    `;

    fetch(`${process.env.API_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env["GRAPHCMS_PAT"]}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          title: payload.title,
          slug: payload.slug,
          date: payload.date,
          content: payload.content,
          categories: payload.categories,
          author: payload.author,
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => console.log("===== IMPORTING... =====", res.data));
  }
};

try {
  run();
} catch (error) {
  console.log(error);
}
