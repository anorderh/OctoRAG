import { Modal } from '@/components/modal/modal';
import { Spinner } from '@/components/spinner';
import { Card, Container, ListBox } from '@/components/ui-react-aria'
import { useAppContext } from '@/hooks/AppProvider';
import { useLibraryService } from '@/hooks/useLibraryService';
import { useResourceService } from '@/hooks/useResourceService';
import { useSessionService } from '@/hooks/useSessionService';
import { ResourceType } from '@/models/constants';
import { Library, OnlineResource, Resource } from '@/models/interfaces';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { l } from 'vite/dist/node/types.d-aGj9QkWt';

export default function LibraryView() {
  let {state} = useAppContext();
  let {libraryId} = useParams();
  let [library, setLibrary] = useState<Library>();
  let [resources, setResources] = useState<OnlineResource[]>([]);

  useEffect(() => {
    let curr = state.libraries.find(l => l._id == libraryId);
    setLibrary(curr);
  }, [state.libraries])
  useEffect(() => {
    if (library) {
      let curr = state.resources.filter(r => r._libraryId == library._id) as OnlineResource[]
      setResources(curr);
    }
  }, [library, state.resources])

  let navigate = useNavigate();
  let libraryService = useLibraryService();
  let resourceService = useResourceService();
  let sessionService = useSessionService();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [resourceType, setResourceType] = useState("YoutubeVideo");
  // const resourceTypes = [
  //   "YoutubeVideo",
  //   "GithubRepo",
  //   "RedditPost",
  //   "XPost",
  //   "TiktokPost",
  //   "MediaWebpage",
  //   "MediaPDF",
  //   "Other"
  // ];
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResourceType(e.target.value); // Capture the selected value
  };

  const scrapeLibrary = () => {
    if (library) {
      libraryService.scrapeLibrary(library._id);
    }
  }

  const addResource = () => {
    if (url == '' || resourceType == '') {
      return;
    }

    if (library) {
      resourceService.addOnlineResource(
        library._id,
        url,
        resourceType
      )
      closeModal();
    }
  }

  const createSession = () => {
    if (library) {
      sessionService.createSession(library._id).then((sessionId: string) => {
        navigate(`/libraries/${library._id}/session/${sessionId}`)
      })
    }
  }

  return (
    <div className="m-2 ml-2 mx-auto flex h-full min-h-screen w-full flex-col dark:bg-neutral-900">
      <h1 className="text-2xl font-bold mb-4">Resources</h1>
      {
        resourceService.loading || libraryService.loading || !library
        ? (
          <Spinner/>
        )
        : (
          <>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map((resource) => (
                <Card key={resource._id} className='p-8 text-wrap'>
                  <h1 className='block text-lg text-wrap overflow-hidden font-bold text-gray-800 dark:text-white sm:text-2xl'>
                    {resource.url}
                  </h1>
                  <h1 className='mt-2 block text-2xl font-bold text-blue-500 dark:text-white sm:text-2xl'>
                    {resource.type}
                  </h1>
                </Card>
              ))}
            </div>
              <div className='flex-row space-x-2'>
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                  onClick={openModal}
                >
                  Add Resource
                </button>
                {
                  resources.length > 0 && (
                    <>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded"
                      onClick={scrapeLibrary}
                      disabled={resources.length == 0}
                    >
                      Scrape Library
                    </button>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={createSession}
                      disabled={resources.length == 0}
                    >
                      Create Chat
                    </button>
                    </>
                  )
                }
              </div>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
              <h2 className="text-xl mb-4">Add Resource</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="name">
                  URL:
                </label>
                <input
                  id="name"
                  className="border rounded px-3 py-2 w-full"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="singleSelect">
                  Select a Resource Type:
                </label>
                <select
                  id="singleSelect"
                  className="border rounded px-3 py-2 w-full"
                  value={resourceType}
                  onChange={handleSelectChange}
                >
                  <option value="YoutubeVideo">Youtube Video</option>
                  <option value="GithubRepo">Github Repo</option>
                  <option value="RedditPost">Reddit Post</option>
                  <option value="XPost">X Post</option>
                  <option value="TiktokPost">Tiktok Post</option>
                  <option value="MediaWebpage">Media Webpage</option>
                  <option value="MediaPDF">Media PDF</option>
                  <option value="Other">Other</option>
                </select>
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
                  onClick={addResource}
                >
                  Add
                </button>
              </div>
            </Modal>
          </>
        )
      }
      {
        library?.pendingScrape == true
          ? (
            <div className="text-red-600 mt-2 ">
              <b>
                This library has not been scraped, or has outdated records.
              </b>
              <div className="text-xs">
                Please press scrape and refresh :]
              </div>
            </div>
          )
          : (
            <></>
          )
      }
    </div>
  )
}
