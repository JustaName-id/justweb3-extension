export const checkIfEnsValid = (ens: string) => {
    const ensRegex = /(?:^|[^a-zA-Z0-9-_.])(([^\s.]{1,63}\.)+[^\s.]{2,63})/g;
    return ensRegex.test(ens);
}

export const extractEnsFromText = (text: string): string => {
    const ensRegex = /(?:^|[^a-zA-Z0-9-_.])(([^\s.]{1,63}\.)+[^\s.]{2,63})/g;
    return text.match(ensRegex)?.[0] || "";
}