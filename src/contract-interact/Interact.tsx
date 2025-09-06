import Header from "../component/Header";

export default function Interact() {
    return (
        <div>
            <div>
                <Header />
            </div>
            <div>
                <h2 className="font-bold p-2 text-2xl">Interact</h2>
                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        placeholder="Enter RPC URL"
                        className="w-full p-2 border border-gray-700 rounded-md"
                    />
                    <input
                        type="text"
                        placeholder="Enter contract address"
                        className="w-full p-2 border border-gray-700 rounded-md"
                    />
                    <textarea
                        name="contractAbi"
                        id=""
                        placeholder="Enter contract ABI"
                        className="w-full h-24 p-2 border border-gray-700 rounded-md text-gray"
                    />
                    <button>Generate UI</button>
                </div>
            </div>
        </div>
    );
}