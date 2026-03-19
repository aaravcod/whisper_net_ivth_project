function decoded = whisperEngine(payload)

    % Ensure current folder is on MATLAB path
    addpath(fileparts(mfilename('fullpath')));

    % 🔥 Encode message → frequencies
    freqs = encodeMessage(payload);

    % 🔥 Convert frequencies → binary
    binaryStr = '';

    for i = 1:length(freqs)
        if freqs(i) == 19000
            binaryStr = strcat(binaryStr, '1');
        else
            binaryStr = strcat(binaryStr, '0');
        end
    end

    % 🔥 Decode binary → original message
    decoded = decodeMessage(binaryStr);

end