export default function Message({ role, text }) {
  return (
    <div
      className={`p-2 my-1 rounded-lg max-w-lg ${
        role === "user"
          ? "bg-blue-500 text-white self-end"
          : "bg-gray-200 text-black self-start"
      }`}
    >
      {text}
    </div>
  );
}
