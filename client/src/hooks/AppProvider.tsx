import React, { createContext, ReactNode, useContext, useReducer, useState } from 'react'
import { Library, Session, Resource, OnlineResource, Chat} from '@/models/interfaces'

// https://medium.com/@ctrlaltmonique/how-to-use-usecontext-and-usereducer-with-typescript-in-react-735f6c5f27ba

export type AppContextState = {
  libraries: Library[];
  sessions: Session[];
  resources: (Resource | OnlineResource)[]
  chats: Chat[]
}

export const DefaultAppContext: AppContextState = {
  libraries: [],
  sessions: [],
  resources: [],
  chats: []
}

export enum AppActionTypes {
  ADD_LIBRARY,
  REMOVE_LIBRARY,
  ADD_RESOURCE,
  REMOVE_RESOURCE,
  ADD_SESSION,
  REMOVE_SESSION,
  ADD_CHAT,
}

export interface AddLibraryAction { type: AppActionTypes.ADD_LIBRARY, payload: Library}
export interface RemoveLibraryAction { type: AppActionTypes.REMOVE_LIBRARY, payload: string }
export interface AddResourceAction { type: AppActionTypes.ADD_RESOURCE, payload: Resource | OnlineResource }
export interface RemoveResourceAction { type: AppActionTypes.REMOVE_RESOURCE, payload: string }
export interface AddSessionAction { type: AppActionTypes.ADD_SESSION, payload: Session }
export interface RemoveSessionAction { type: AppActionTypes.REMOVE_SESSION, payload: string }
export interface AddChatAction { type: AppActionTypes.ADD_CHAT, payload: Chat}

export type AppAction = 
  | AddLibraryAction
  | RemoveLibraryAction
  | AddResourceAction
  | RemoveResourceAction
  | AddSessionAction
  | RemoveSessionAction
  | AddChatAction

function appReducer(state: AppContextState, action: AppAction) {
  const getStateCopy = () => ({ ...state } as AppContextState);

  switch(action.type) {
    // Libraries.
    case AppActionTypes.ADD_LIBRARY: {
      let copy = getStateCopy();
      copy.libraries = [
        ...copy.libraries,
        action.payload
      ];

      return copy;
    }
    case AppActionTypes.REMOVE_LIBRARY: {
      let copy = getStateCopy();
      copy.libraries = copy.libraries.filter(l => l._id !== action.payload);
      
      return copy;
    }

    // Resources.
    case AppActionTypes.ADD_RESOURCE: {
      let copy = getStateCopy();
      let newResource = action.payload as Resource | OnlineResource;
      copy.resources = [
        ...copy.resources,
        newResource
      ];

      return copy;
    }
    case AppActionTypes.REMOVE_RESOURCE: {
      let copy = getStateCopy();
      let resourceId = action.payload as string;
      copy.resources = copy.resources.filter(r => r._id !== resourceId);

      return copy;
    }

    // Sessions.
    case AppActionTypes.ADD_SESSION: {
      let copy = getStateCopy();
      let newSession = action.payload as Session;
      copy.sessions = [
        ...copy.sessions,
        newSession
      ];

      return copy;
    }
    case AppActionTypes.REMOVE_SESSION: {
      let copy = getStateCopy();
      let sessionId = action.payload as string;
      copy.sessions = copy.sessions.filter(s => s._id !== sessionId);

      return copy;
    }

    // Chats.
    case AppActionTypes.ADD_CHAT: {
      let copy = getStateCopy();
      let newChat = action.payload as Chat;
      copy.chats = [
        ...copy.chats,
        newChat
      ];

      return copy;
    }

    default:
      throw new Error("App action not recognized.");
  }
}
  
export type AppContextType = {
  state: AppContextState,
  dispatch: React.Dispatch<AppAction>
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'The App Context must be used within an AppContextProvider'
    );
  }
  return context;
}

export function AppProvider({ children }: { children?: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, DefaultAppContext);

  return (
    <AppContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </AppContext.Provider>
  )
}
