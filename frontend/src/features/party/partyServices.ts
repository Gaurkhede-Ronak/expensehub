

import axiosInstance from "../../services/axiosInstance";
 
import type {

    Party,

    PartyPayload,

    PartyApiResponse,

} from "./partyTypes";
 

export const getAllParties = async () => {

    const response = await axiosInstance.get<

        PartyApiResponse<Party[]>
>("/api/partymaster/getallparties");
 
    return response.data;

};
 

export const getSingleParty = async (id: string) => {

    const response = await axiosInstance.get<

        PartyApiResponse<Party>
>(`/api/partymaster/singleparty/${id}`);
 
    return response.data;

};
 

export const createParty = async (data: PartyPayload) => {

    const response = await axiosInstance.post<

        PartyApiResponse<Party>
>("/api/partymaster/createparty", data);
 
    return response.data;

};
 

export const updateParty = async (

    id: string,

    data: Partial<PartyPayload>

) => {

    const response = await axiosInstance.patch<

        PartyApiResponse<Party>
>(`/api/partymaster/updateparty/${id}`, data);
 
    return response.data;

};
 

export const deleteParty = async (id: string) => {

    const response = await axiosInstance.delete<

        PartyApiResponse<unknown>
>(`/api/partymaster/deleteparty/${id}`);
 
    return response.data;

};

 