function decoded = whisperEngine(payload)

    % Ensure current folder is on MATLAB path
    addpath(fileparts(mfilename('fullpath')));

    % Encode message into frequencies
    [freqs, ~] = encodeMessage(payload);

    % Decode frequencies back to message
    decoded = decodeSignal(freqs);

end