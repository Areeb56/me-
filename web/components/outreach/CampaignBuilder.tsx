export const CampaignBuilder = () => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="font-semibold mb-4">Create New Campaign</h2>
      <form>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-400">Campaign Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter campaign name"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-400">Target Industry</label>
          <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Technology</option>
            <option>Finance</option>
            <option>Healthcare</option>
            <option>Retail</option>
            <option>Manufacturing</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-400">Value Proposition</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe your value proposition"
          />
        </div>
        <div className="mb-6">
          <button type="submit" className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
            Create Campaign
          </button>
        </div>
      </form>
    </div>
  );
};
