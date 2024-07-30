'use server'

import {nanoid} from 'nanoid'
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';


export const createDocument= async ({ userId,email}:
CreateDocumentParams) =>{
    const roomId= nanoid();

    try{
       const metadata ={
        creatorId: userId,
        email,
        title:'untitled'
       }
       
       const usersAccesses: RoomAccesses={
        [email]:['room:write']
       }

       const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses:[]
      });

      revalidatePath('/');
      return parseStringify(room);
      
    } catch(error){
        console.log(`Error happened while creating a room: ${error}`);
            
    }
}

export const getDocument = async ({roomId, userId}:{ roomId: string, userId:string})=>{
  try{
    const room = await liveblocks.getRoom(roomId);


    const hasAccess = Object.keys(room.usersAccesses).includes(userId);


    if(!hasAccess){
      throw new Error('You do not have access to thid document');
    }

    return parseStringify(room);
  }catch(error){
    console.log(`Error happened while getting a room:${error}`);
  }
}

export const updateDocument= async (roomId: string,title: string) =>{
  try{
    const updatedRoom = await liveblocks.updateRoom(roomId,{
      metadata:{
        title
      }
    })

    revalidatePath(`documents/${roomId}`);

    return parseStringify(updatedRoom);

  }catch(error){
    console.log(`Error happened while updating a room: ${error}`)
  }
}

export const getDocuments = async (email:string)=>{
  try{
    const rooms = await liveblocks.getRooms({userId:email});

    return parseStringify(rooms);
  }catch(error){
    console.log(`Error happened while getting a room:${error}`);
  }
}

export const updateDocumentAccess = async ({ roomId, email, userType, updatedBy }: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    }

    const room = await liveblocks.updateRoom(roomId, { 
      usersAccesses
    })

    if(room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email
        },
        roomId
      })
    }
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating a room access: ${error}`);
  }
}

export const removeCollaborator = async ({ roomId, email }: {roomId: string, email: string}) => {
  try {
    const room = await liveblocks.getRoom(roomId)

    if(room.metadata.email === email) {
      throw new Error('You cannot remove yourself from the document');
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null
      }
    })

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
} 

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath('/');
    redirect('/');
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
}
// Define the base URL for your API
const API_BASE_URL = 'rashisdocify.netlify.app'; // Replace with your API base URL

// Function to fetch document content
export async function fetchDocument(roomId: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${roomId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }
    const data = await response.json();
    return data.content; // Adjust based on your API response structure
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

// Function to save document content
export async function saveDocument(roomId: string, content: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${roomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }), // Adjust based on your API requirements
    });
    if (!response.ok) {
      throw new Error('Failed to save document');
    }
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}
