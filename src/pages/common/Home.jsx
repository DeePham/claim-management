import React, { useState } from "react";
import { IoIosLink } from "react-icons/io";
import { FaHashtag } from "react-icons/fa";
import { ARTICLES } from "@/constants/articles";

const Home = () => {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Header />
      <ClaimArticles />
    </div>
  );
};

function Header() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <svg
          className="text-muted-foreground h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          ></path>
        </svg>
        <h2 className="text-2xl font-semibold">Home</h2>
      </div>
      <p className="text-muted-foreground">
        Welcome to our claims management system. Stay informed about the latest
        claim processes and tips.
      </p>
    </div>
  );
}

function ClaimArticles() {
  const [visibleCount, setVisibleCount] = useState(1);

  const handleReadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 1, ARTICLES.length));
  };

  return (
    <div className="space-y-6">
      {ARTICLES.slice(0, visibleCount).map((article, index) => (
        <Articles key={index} article={article} />
      ))}

      <div className="flex justify-center">
        {visibleCount < ARTICLES.length ? (
          <ButtonAction onClick={handleReadMore}>Read more</ButtonAction>
        ) : (
          <p className="text-muted-foreground">No more articles to load.</p>
        )}
      </div>
    </div>
  );
}

function Articles({ article }) {
  return (
    <div className="">
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <FaHashtag className="text-muted-foreground" />
            <span>{article.title}</span>
            <IoIosLink className="text-muted-foreground" />
          </h3>
          <hr className="border-border mt-2 w-[30%]" />
        </div>

        <p className="text-muted-foreground">{article.content}</p>

        <img
          src={article.image}
          alt={article.title}
          className="h-96 w-full rounded-md object-cover"
        />
      </div>
    </div>
  );
}

function ButtonAction({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors"
    >
      {children}
    </button>
  );
}

export default Home;
