import { InlineSpinner, Spinner } from '@/components/spinner';
import { useAppContext } from '@/hooks/AppProvider';
import { useSessionService } from '@/hooks/useSessionService'
import { ChatType } from '@/models/constants';
import { Chat, Library, Session } from '@/models/interfaces';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SessionView() {
  let { state } = useAppContext();
  let { sessionId } = useParams();
  let {
    loading, 
    chat
  } = useSessionService();

  let [session, setSession] = useState<Session>();
  useEffect(() => {
    setSession(state.sessions.find(s => s._id== sessionId));
  })
  let [chats, setChats] = useState<Chat[]>([]);
  useEffect(() => {
    if (session) {
      setChats(state.chats.filter(c => c._sessionId == session._id))
    }
  }, [session, state.chats])
  let [library, setLibrary] = useState<Library>();
  useEffect(() => {
    if (session) {
      setLibrary(state.libraries.find(l => l._id == session._libraryId))
    }
  }, [session,state.libraries])


  const [input, setInput] = useState<string>('');  
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    chat(session!._id, input);
    setInput('');
  };

  return (
    <div className="m-2 mx-auto flex h-full w-[75%] flex-col dark:bg-neutral-900">
      <div className="flex flex-row space-x-2 text-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Chat Session: "{library?.name}"</h1>
        {
          loading
          ? (
            <InlineSpinner/>
          )
          : (
            <></>
          )
        }
      </div>
      {/* Chat messages */}
      <div className="flex-grow overflow-y-auto space-y-4 p-4">
          {chats.map((c: Chat) => (
            <div
              key={c._id}
              className={`flex ${
                c.type === ChatType.Human ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`p-4 max-w-xs rounded-lg ${
                  c.type === ChatType.Human
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {c.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input field */}
        {
          !loading && (
            <div className="p-4 bg-gray-100">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-lg"
                  placeholder="Type your message here..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          )
        }
        
      </div>
  );
}
