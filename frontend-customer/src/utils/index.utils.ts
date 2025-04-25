export const isEqual = (pos1: { lat: number, lng: number }, pos2: { lat: number, lng: number }) => {
    return pos1.lat === pos2.lat && pos1.lng === pos2.lng;
}