function Career() {
  const formUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLSdzOYGuOJVllSmrlYQN9rXvCpB7meQYfv6VYS2QDTLV1cIQSw/viewform";

  return (
    <div className="h-[85vh]">
      <div className="mt-10 flex justify-center px-4">
        <div className="w-full max-w-2xl rounded-lg bg-white p-6 font-roboto border-t-8 border-[#673ab7]">
          {/* Title */}
          <h2 className="mb-3 text-2xl font-normal text-gray-900 sm:text-3xl">
            Faculty Application form - VEC
          </h2>

          {/* Required text */}
          <p className="mb-6 text-sm text-gray-500">
            <span className="text-red-500">*</span> Indicates required question
          </p>

          {/* Button */}
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded bg-[#673ab7] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#5e35b1]"
          >
            Fill out form
          </a>

          {/* Footer */}
          <div className="mt-6 text-xs text-gray-500">
            <span className="font-medium text-gray-600">Google Forms</span>{" "}
            · This form was created inside of Velammal Engineering College.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Career;