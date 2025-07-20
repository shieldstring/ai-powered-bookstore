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
    originalPrice: 29.99,
    isbn: "9780525559474",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2020-09-29"),
    publisher: "Viking",
    image:
      "https://img1.od-cdn.com/ImageType-100/0293-1/%7BEB3594ED-AC51-4EF3-B21A-F8E7C4B77E8A%7DImg100.jpg",
    category: "Fiction",
    tag: "BEST SELLER",
    affiliateLink: "https://bookstore.com/midnight-library",
    inventory: 45,
    purchaseCount: 1289,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c85"),
        rating: 5,
        comment:
          "Absolutely life-changing book. The concept really made me think about my choices.",
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c86"),
        rating: 4,
        comment:
          "Beautiful writing and thought-provoking premise. A bit predictable toward the end.",
      },
    ],
    edition: "First Edition",
    pageCount: 288,
    dimensions: { height: 8.2, width: 5.5, thickness: 1.1 },
    weight: 0.8,
  },
  {
    title: "Algorithms to Live By",
    author: "Brian Christian & Tom Griffiths",
    description:
      "How computer algorithms can be applied to our everyday lives, helping to solve common decision-making problems.",
    price: 19.99,
    originalPrice: 25.99,
    isbn: "9781627790369",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2016-04-19"),
    publisher: "Henry Holt and Co.",
    image:
      "https://sanfranciscobookreview.com/wp-content/uploads/2016/06/algorithms_to_live_by.jpg",
    category: "Non-Fiction",
    tag: "BEST SELLER",
    affiliateLink: "https://bookstore.com/algorithms-live-by",
    inventory: 32,
    purchaseCount: 785,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c87"),
        rating: 5,
        comment:
          "As a programmer, I found this incredibly insightful. Great applications of CS concepts.",
      },
    ],
    edition: null,
    pageCount: 480,
    dimensions: { height: 9.3, width: 6.3, thickness: 1.5 },
    weight: 1.2,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description:
      "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
    price: 17.99,
    originalPrice: 21.99,
    isbn: "9780441172719",
    language: "English",
    format: "Paperback",
    publishDate: new Date("1990-09-01"),
    publisher: "Ace Books",
    image:
      "https://i.pinimg.com/originals/1c/2d/4b/1c2d4b6633bc681f44a05095d8a6ddb0.jpg",
    category: "Science Fiction",
    tag: "",
    affiliateLink: "https://bookstore.com/dune",
    inventory: 78,
    purchaseCount: 3421,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c88"),
        rating: 5,
        comment:
          "A masterpiece of science fiction. The worldbuilding is unparalleled.",
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c89"),
        rating: 4,
        comment:
          "Complex but rewarding. Takes some time to get into but worth the effort.",
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8a"),
        rating: 5,
        comment: "The best sci-fi book ever written. Period.",
      },
    ],
    edition: null,
    pageCount: 604,
    dimensions: { height: 7.5, width: 5.1, thickness: 1.6 },
    weight: 0.9,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "An easy and proven way to build good habits and break bad ones.",
    price: 15.99,
    originalPrice: 19.99,
    isbn: "9780735211292",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2018-10-16"),
    publisher: "Avery",
    image:
      "https://jamesclear.com/wp-content/uploads/2021/08/atomic-habits-dots-1.png",
    category: "Self-Help",
    tag: "BEST SELLER",
    affiliateLink: "https://bookstore.com/atomic-habits",
    inventory: 120,
    purchaseCount: 5231,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8b"),
        rating: 5,
        comment:
          "Changed how I approach behavior change. The 1% better concept is revolutionary.",
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8c"),
        rating: 5,
        comment:
          "Practical advice that's actually implementable. Has genuinely improved my daily routines.",
      },
    ],
    edition: null,
    pageCount: 320,
    dimensions: { height: 8.5, width: 5.8, thickness: 1.2 },
    weight: 0.7,
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description:
      "A psychological thriller about a woman's act of violence against her husband—and her refusal to speak about it afterward.",
    price: 14.99,
    originalPrice: 17.99,
    isbn: "9781250301697",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2019-02-05"),
    publisher: "Celadon Books",
    image: "https://m.media-amazon.com/images/I/91BbLCJOruL.jpg",
    category: "Thriller",
    tag: "BEST SELLER",
    affiliateLink: "https://bookstore.com/silent-patient",
    inventory: 23,
    purchaseCount: 2187,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8d"),
        rating: 4,
        comment: "The twist at the end was unexpected. Good page-turner.",
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8e"),
        rating: 3,
        comment: "Started strong but I found the ending a bit contrived.",
      },
    ],
    edition: null,
    pageCount: 336,
    dimensions: { height: 8.2, width: 5.5, thickness: 1.1 },
    weight: 0.6,
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description:
      "A memoir about a woman who grew up in a survivalist family in Idaho and her journey to education.",
    price: 16.99,
    originalPrice: 20.99,
    isbn: "9780399590504",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2018-02-20"),
    publisher: "Random House",
    image: "https://cdn2.penguin.com.au/covers/original/9780099511021.jpg",
    category: "Biography & Autobiography",
    tag: "BEST SELLER",
    affiliateLink: "https://bookstore.com/educated",
    inventory: 41,
    purchaseCount: 1823,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8f"),
        rating: 5,
        comment:
          "Powerful story of resilience and self-determination. Couldn't put it down.",
      },
    ],
    edition: null,
    pageCount: 352,
    dimensions: { height: 8.0, width: 5.3, thickness: 1.0 },
    weight: 0.7,
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    description:
      "A lone astronaut must save the earth from disaster in this new adventure from the author of The Martian.",
    price: 22.99,
    originalPrice: 28.99,
    isbn: "9780593135204",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2021-05-04"),
    publisher: "Ballantine Books",
    image:
      "https://planetary.s3.amazonaws.com/web/assets/pictures/project-hail-mary-cover-weir.jpg",
    category: "Science Fiction",
    tag: "",
    affiliateLink: "https://bookstore.com/project-hail-mary",
    inventory: 52,
    purchaseCount: 1562,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c90"),
        rating: 5,
        comment:
          "Even better than The Martian! The science is fascinating and the characters are compelling.",
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c91"),
        rating: 5,
        comment:
          "A perfect blend of humor, science, and heart. Rocky is my favorite character ever.",
      },
    ],
    edition: null,
    pageCount: 496,
    dimensions: { height: 8.5, width: 5.8, thickness: 1.4 },
    weight: 1.1,
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description:
      "Timeless lessons on wealth, greed, and happiness, exploring how money moves around in an economy and how people think about it.",
    price: 18.99,
    originalPrice: 22.99,
    isbn: "9780857197689",
    language: "English",
    format: "Paperback",
    publishDate: new Date("2020-09-08"),
    publisher: "Harriman House",
    image:
      "https://i.pinimg.com/736x/e6/a2/c6/e6a2c6b650e79f1095f381f54a8bab69.jpg",
    category: "Business & Economics",
    tag: "BEST SELLER",
    affiliateLink: "https://bookstore.com/psychology-money",
    inventory: 67,
    purchaseCount: 2913,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c92"),
        rating: 5,
        comment:
          "Changed my relationship with money completely. Simple yet profound concepts.",
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c93"),
        rating: 4,
        comment:
          "Great insights into behavioral finance. Should be required reading in high school.",
      },
    ],
    edition: null,
    pageCount: 256,
    dimensions: { height: 7.8, width: 5.1, thickness: 0.8 },
    weight: 0.5,
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    description:
      "A novel about an abandoned girl who raised herself in the marshes of North Carolina.",
    price: 15.99,
    originalPrice: 18.99,
    isbn: "9780735219090",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2018-08-14"),
    publisher: "G.P. Putnam's Sons",
    image:
      "https://s26162.pcdn.co/wp-content/uploads/sites/2/2018/08/where-the-crawdads-sing.jpg",
    category: "Fiction",
    tag: "BEST SELLER",
    affiliateLink: "https://bookstore.com/crawdads",
    inventory: 29,
    purchaseCount: 3542,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c94"),
        rating: 4,
        comment:
          "Beautiful writing and evocative setting. The ending surprised me.",
      },
    ],
    edition: null,
    pageCount: 384,
    dimensions: { height: 8.2, width: 5.5, thickness: 1.3 },
    weight: 0.9,
  },
  {
    title: "The Four Winds",
    author: "Kristin Hannah",
    description:
      "A story of love, heroism, and hope, set during the Great Depression and the Dust Bowl era.",
    price: 18.99,
    originalPrice: 22.99,
    isbn: "9781250178602",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2021-02-02"),
    publisher: "St. Martin's Press",
    image: "https://m.media-amazon.com/images/I/71jAoWfIgmL._SL1500_.jpg",
    category: "Historical Fiction",
    tag: "BEST SELLER",
    affiliateLink: "https://bookstore.com/four-winds",
    inventory: 34,
    purchaseCount: 1765,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c95"),
        rating: 5,
        comment:
          "Heart-wrenching and beautiful. Kristin Hannah's best work yet.",
      },
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c96"),
        rating: 4,
        comment:
          "A powerful portrait of American resilience. Made me appreciate what past generations endured.",
      },
    ],
    edition: null,
    pageCount: 464,
    dimensions: { height: 9.0, width: 6.0, thickness: 1.4 },
    weight: 1.0,
  },
];

// Insert function remains the same
async function insertSampleData() {
  try {
    const Book = require("../models/Book");
    const User = require("../models/User");

    // Find or create a seller (platform seller)
    let seller = await User.findOne({ email: "platformseller@example.com" });

    if (!seller) {
      seller = await User.create({
        name: "Platform Seller",
        email: "platformseller@example.com",
        password: "platformpassword123", // (hash before production use)
        role: "seller",
      });

      console.log("Created platform seller account");
    }

    // Attach seller to each book
    const booksWithSeller = bookSampleData.map((book) => ({
      ...book,
      seller: seller._id,
    }));

    await Book.deleteMany({});
    const result = await Book.insertMany(booksWithSeller);

    console.log(`Inserted ${result.length} books with seller`);
    return result;
  } catch (error) {
    console.error("Error inserting sample data:", error);
    throw error;
  }
}

module.exports = { bookSampleData, insertSampleData };
