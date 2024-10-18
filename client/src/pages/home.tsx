import { useAppContext } from "@/hooks/AppProvider"
import { ListBox, ListBoxItem } from "@/components/ui-react-aria";
import { useLibraryService } from "@/hooks/useLibraryService";
import { Spinner } from "@/components/spinner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Library } from "@/models/interfaces";
import "../css/library.css";
import { Modal } from "@/components/modal/modal";

export default function Home() {
  let {state} = useAppContext();
  let navigate = useNavigate();
  let {
    loading,
    addLibrary
  } = useLibraryService();

  const openLibrary = (libraryId: string) => {
    navigate(`/libraries/${libraryId}`); // Navigate to a dynamic route for each library
  };

  const addNewLibrary = () => {
    addLibrary(name);
    setName('');
    closeModal();
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  console.log(state);

  return (
    <div className="m-2 ml-2 mx-auto flex h-full min-h-screen w-full flex-col dark:bg-neutral-900">
      <h1 className="text-2xl font-bold mb-4">Libraries</h1>
      {
        loading
          ? (
            <Spinner />
          )
          : (
            <div className="p-4 m-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.libraries.map((library, index) => (
                <div
                  key={index}
                  onClick={() => openLibrary(library._id)}
                  className="library-card shadow-lg p-6 bg-white dark:bg-neutral-800 rounded-lg"
                >
                  <h2 className="font-semibold text-lg">{library.name}</h2>
                </div>
              ))}
            </div>
          )
      }
      <div className='pt-4'>
        <button
          className="p-2 m-2 bg-blue-500 border-r-4 text-white"
          onClick={() => openModal()}
        >
          Add new library
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl mb-4">Add Library</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="name">
            Library Name
          </label>
          <input
            id="name"
            className="border rounded px-3 py-2 w-full"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={addNewLibrary}
          >
            Add
          </button>
        </div>
      </Modal>
    </div>
  )
}
