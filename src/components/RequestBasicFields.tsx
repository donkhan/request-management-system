interface Props {
  title: string
  description: string
  setTitle: (v: string) => void
  setDescription: (v: string) => void
  isReadOnly: boolean
}

export default function RequestBasicFields({
  title,
  description,
  setTitle,
  setDescription,
  isReadOnly,
}: Props) {
  return (
    <>
      {/* TITLE */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Title
        </label>

        <input
          type="text"
          value={title}
          readOnly={isReadOnly}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-xl p-4"
        />
      </div>

      {/* DESCRIPTION */}
      <div className="mb-8">
        <label className="block mb-2 font-medium text-gray-700">
          Description
        </label>

        <textarea
          rows={5}
          value={description}
          readOnly={isReadOnly}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-xl p-4"
        />
      </div>
    </>
  )
}