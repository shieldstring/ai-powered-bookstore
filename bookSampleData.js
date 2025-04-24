// Sample data for MongoDB Book collection with embedded reviews
// Note: MongoDB will automatically generate _id fields for the main documents and subdocuments
const mongoose = require("mongoose");
const bookSampleData = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description:
      "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    price: 24.99,
    image:
      "https://img1.od-cdn.com/ImageType-100/0293-1/%7BEB3594ED-AC51-4EF3-B21A-F8E7C4B77E8A%7DImg100.jpg",
    tag: "BEST SELLER",
    category: "Fiction",
    affiliateLink: "https://bookstore.com/midnight-library",
    inventory: 45,
    purchaseCount: 1289,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c85"),
        rating: 5,
        comment:
          "Absolutely life-changing book. The concept really made me think about my choices.",
        createdAt: new Date("2023-09-15T14:32:21.000Z"),
        updatedAt: new Date("2023-09-15T14:32:21.000Z"),
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c86"),
        rating: 4,
        comment:
          "Beautiful writing and thought-provoking premise. A bit predictable toward the end.",
        createdAt: new Date("2023-10-02T08:14:53.000Z"),
        updatedAt: new Date("2023-10-02T08:14:53.000Z"),
      },
    ],
    createdAt: new Date("2023-08-01T10:23:54.000Z"),
    updatedAt: new Date("2024-01-15T16:42:10.000Z"),
  },
  {
    title: "Algorithms to Live By",
    author: "Brian Christian & Tom Griffiths",
    description:
      "How computer algorithms can be applied to our everyday lives, helping to solve common decision-making problems.",
    price: 19.99,
    image:
      "https://sanfranciscobookreview.com/wp-content/uploads/2016/06/algorithms_to_live_by.jpg",
    tag: "BEST SELLER",
    category: "Non-fiction",
    affiliateLink: "https://bookstore.com/algorithms-live-by",
    inventory: 32,
    purchaseCount: 785,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c87"),
        rating: 5,
        comment:
          "As a programmer, I found this incredibly insightful. Great applications of CS concepts.",
        createdAt: new Date("2023-11-18T21:45:33.000Z"),
        updatedAt: new Date("2023-11-18T21:45:33.000Z"),
      },
    ],
    createdAt: new Date("2023-07-12T09:10:23.000Z"),
    updatedAt: new Date("2024-02-03T11:24:15.000Z"),
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description:
      "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
    price: 17.99,
    image:
      "https://i.pinimg.com/originals/1c/2d/4b/1c2d4b6633bc681f44a05095d8a6ddb0.jpg",
    tag: "",
    category: "Science Fiction",
    affiliateLink: "https://bookstore.com/dune",
    inventory: 78,
    purchaseCount: 3421,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c88"),
        rating: 5,
        comment:
          "A masterpiece of science fiction. The worldbuilding is unparalleled.",
        createdAt: new Date("2023-08-29T15:12:44.000Z"),
        updatedAt: new Date("2023-08-29T15:12:44.000Z"),
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c89"),
        rating: 4,
        comment:
          "Complex but rewarding. Takes some time to get into but worth the effort.",
        createdAt: new Date("2023-09-14T18:23:10.000Z"),
        updatedAt: new Date("2023-09-14T18:23:10.000Z"),
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8a"),
        rating: 5,
        comment: "The best sci-fi book ever written. Period.",
        createdAt: new Date("2023-12-01T07:41:22.000Z"),
        updatedAt: new Date("2023-12-01T07:41:22.000Z"),
      },
    ],
    createdAt: new Date("2023-06-15T14:23:11.000Z"),
    updatedAt: new Date("2024-03-10T09:15:34.000Z"),
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "An easy and proven way to build good habits and break bad ones.",
    price: 15.99,
    image:
      "https://jamesclear.com/wp-content/uploads/2021/08/atomic-habits-dots-1.png",
    tag: "BEST SELLER",
    category: "Self-help",
    affiliateLink: "https://bookstore.com/atomic-habits",
    inventory: 120,
    purchaseCount: 5231,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8b"),
        rating: 5,
        comment:
          "Changed how I approach behavior change. The 1% better concept is revolutionary.",
        createdAt: new Date("2023-10-22T11:32:54.000Z"),
        updatedAt: new Date("2023-10-22T11:32:54.000Z"),
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8c"),
        rating: 5,
        comment:
          "Practical advice that's actually implementable. Has genuinely improved my daily routines.",
        createdAt: new Date("2023-11-30T16:45:12.000Z"),
        updatedAt: new Date("2023-11-30T16:45:12.000Z"),
      },
    ],
    createdAt: new Date("2023-05-20T08:34:22.000Z"),
    updatedAt: new Date("2024-02-28T13:51:09.000Z"),
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description:
      "A psychological thriller about a woman's act of violence against her husband—and her refusal to speak about it afterward.",
    price: 14.99,
    image: "https://m.media-amazon.com/images/I/91BbLCJOruL.jpg",
    tag: "BEST SELLER",
    category: "Thriller",
    affiliateLink: "https://bookstore.com/silent-patient",
    inventory: 23,
    purchaseCount: 2187,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8d"),
        rating: 4,
        comment: "The twist at the end was unexpected. Good page-turner.",
        createdAt: new Date("2023-12-12T19:21:33.000Z"),
        updatedAt: new Date("2023-12-12T19:21:33.000Z"),
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8e"),
        rating: 3,
        comment: "Started strong but I found the ending a bit contrived.",
        createdAt: new Date("2024-01-03T20:15:43.000Z"),
        updatedAt: new Date("2024-01-03T20:15:43.000Z"),
      },
    ],
    createdAt: new Date("2023-09-11T12:54:32.000Z"),
    updatedAt: new Date("2024-01-25T14:22:18.000Z"),
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description:
      "A memoir about a woman who grew up in a survivalist family in Idaho and her journey to education.",
    price: 16.99,
    image: "https://cdn2.penguin.com.au/covers/original/9780099511021.jpg",
    tag: "BEST SELLER",
    category: "Memoir",
    affiliateLink: "https://bookstore.com/educated",
    inventory: 41,
    purchaseCount: 1823,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8f"),
        rating: 5,
        comment:
          "Powerful story of resilience and self-determination. Couldn't put it down.",
        createdAt: new Date("2023-10-05T10:12:54.000Z"),
        updatedAt: new Date("2023-10-05T10:12:54.000Z"),
      },
    ],
    createdAt: new Date("2023-08-22T11:32:45.000Z"),
    updatedAt: new Date("2024-02-15T17:23:19.000Z"),
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    description:
      "A lone astronaut must save the earth from disaster in this new adventure from the author of The Martian.",
    price: 22.99,
    image:
      "https://planetary.s3.amazonaws.com/web/assets/pictures/project-hail-mary-cover-weir.jpg",
    tag: "",
    category: "Science Fiction",
    affiliateLink: "https://bookstore.com/project-hail-mary",
    inventory: 52,
    purchaseCount: 1562,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c90"),
        rating: 5,
        comment:
          "Even better than The Martian! The science is fascinating and the characters are compelling.",
        createdAt: new Date("2023-11-08T14:23:45.000Z"),
        updatedAt: new Date("2023-11-08T14:23:45.000Z"),
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c91"),
        rating: 5,
        comment:
          "A perfect blend of humor, science, and heart. Rocky is my favorite character ever.",
        createdAt: new Date("2023-12-19T21:34:12.000Z"),
        updatedAt: new Date("2023-12-19T21:34:12.000Z"),
      },
    ],
    createdAt: new Date("2023-07-05T16:43:22.000Z"),
    updatedAt: new Date("2024-03-01T09:12:43.000Z"),
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description:
      "Timeless lessons on wealth, greed, and happiness, exploring how money moves around in an economy and how people think about it.",
    price: 18.99,
    image:
      "https://i.pinimg.com/736x/e6/a2/c6/e6a2c6b650e79f1095f381f54a8bab69.jpg",
    tag: "BEST SELLER",
    category: "Finance",
    affiliateLink: "https://bookstore.com/psychology-money",
    inventory: 67,
    purchaseCount: 2913,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c92"),
        rating: 5,
        comment:
          "Changed my relationship with money completely. Simple yet profound concepts.",
        createdAt: new Date("2023-09-25T11:23:43.000Z"),
        updatedAt: new Date("2023-09-25T11:23:43.000Z"),
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c93"),
        rating: 4,
        comment:
          "Great insights into behavioral finance. Should be required reading in high school.",
        createdAt: new Date("2023-10-17T15:32:11.000Z"),
        updatedAt: new Date("2023-10-17T15:32:11.000Z"),
      },
    ],
    createdAt: new Date("2023-06-28T13:21:43.000Z"),
    updatedAt: new Date("2024-02-20T10:15:33.000Z"),
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    description:
      "A novel about an abandoned girl who raised herself in the marshes of North Carolina.",
    price: 15.99,
    image:
      "https://s26162.pcdn.co/wp-content/uploads/sites/2/2018/08/where-the-crawdads-sing.jpg",
    tag: "BEST SELLER",
    category: "Fiction",
    affiliateLink: "https://bookstore.com/crawdads",
    inventory: 29,
    purchaseCount: 3542,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c94"),
        rating: 4,
        comment:
          "Beautiful writing and evocative setting. The ending surprised me.",
        createdAt: new Date("2023-10-12T17:23:42.000Z"),
        updatedAt: new Date("2023-10-12T17:23:42.000Z"),
      },
    ],
    createdAt: new Date("2023-08-15T14:32:11.000Z"),
    updatedAt: new Date("2024-01-20T11:45:22.000Z"),
  },
  {
    title: "The Four Winds",
    author: "Kristin Hannah",
    description:
      "A story of love, heroism, and hope, set during the Great Depression and the Dust Bowl era.",
    price: 18.99,
    image: "https://m.media-amazon.com/images/I/71jAoWfIgmL._SL1500_.jpg",
    tag: "BEST SELLER",
    category: "Historical Fiction",
    affiliateLink: "https://bookstore.com/four-winds",
    inventory: 34,
    purchaseCount: 1765,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c95"),
        rating: 5,
        comment:
          "Heart-wrenching and beautiful. Kristin Hannah's best work yet.",
        createdAt: new Date("2023-11-05T12:43:21.000Z"),
        updatedAt: new Date("2023-11-05T12:43:21.000Z"),
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c96"),
        rating: 4,
        comment:
          "A powerful portrait of American resilience. Made me appreciate what past generations endured.",
        createdAt: new Date("2023-12-07T19:32:11.000Z"),
        updatedAt: new Date("2023-12-07T19:32:11.000Z"),
      },
    ],
    createdAt: new Date("2023-09-20T11:23:45.000Z"),
    updatedAt: new Date("2024-02-11T14:32:56.000Z"),
  },
];

// Example of how to insert this data into MongoDB
async function insertSampleData() {
  try {
    // Assuming you have a Book model already defined
    const Book = require("./models/Book");

    // Clear existing data (optional)
    await Book.deleteMany({});

    // Insert the sample data
    const result = await Book.insertMany(bookSampleData);

    console.log(`${result.length} books successfully inserted`);
    return result;
  } catch (error) {
    console.error("Error inserting sample data:", error);
    throw error;
  }
}

module.exports = { bookSampleData, insertSampleData };
