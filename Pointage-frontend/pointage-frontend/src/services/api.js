import axios from '../axiosConfig';

// Collaborators
export const getCollaborators = () => axios.get('/collab');
export const getCollaboratorById = (id) => axios.get(`/collab/${id}`);
export const createCollaborator = (collaborator) => axios.post('/collab', collaborator);
export const updateCollaborator = (id, collaborator) => axios.put(`/collab/${id}`, collaborator);
export const deleteCollaborator = (id) => axios.delete(`/collab/${id}`);

// Machines
export const getMacAddress = () => axios.get('/mach/mac');
export const getOrdName = () => axios.get('/mach/ordName');
export const getMachines = () => axios.get('/mach');
export const getMachineById = (id) => axios.get(`/mach/${id}`);
export const createMachine = (machine) => axios.post('/mach', machine);
export const deleteMachine = (id) => axios.delete(`/mach/${id}`);


// Shifts
export const getShifts = () => axios.get('/shift');
export const getShiftById = (id) => axios.get(`/shift/${id}`);
export const createShift = (shift) => axios.post('/shift', shift);
export const deleteShift = (id) => axios.delete(`/shift/${id}`);
export const updateShift = (id, shift) => axios.put(`/shift/${id}`, shift);
