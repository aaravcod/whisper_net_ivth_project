function out = ultrasonic_sim(msg)
    % ULTRASONIC_SIM Encode a message into ultrasonic frequencies and decode it back
    % Input:  msg (string or char array)
    % Output: formatted string with Encoded, Frequencies, and Decoded message

    % Parameters
    fs = 48000;        % Sampling frequency (Hz)
    T = 0.1;           % Duration of each tone (s)
    t = 0:1/fs:T-1/fs; % Time vector
    
    % Define allowed characters
    charset = ['A':'Z' 'a':'z' '0':'9' ' ' '.' ',' '!' '?' '-' '_' '@' '#'];
    nChars  = length(charset);

    % Frequency mapping (linear)
    fStart = 18000;        % Starting frequency (Hz)
    fStep  = 100;          % Step per character (Hz)
    freqs  = fStart + (0:nChars-1) * fStep; % All possible frequencies

    % Encode
    signal = [];
    encodedFreqs = [];
    for i = 1:length(msg)
        ch = msg(i);
        idx = find(charset == ch, 1); % find character position
        if ~isempty(idx)
            f = freqs(idx);
            tone = sin(2*pi*f*t);
            signal = [signal tone]; %#ok<AGROW>
            encodedFreqs(end+1) = f; %#ok<AGROW>
        else
            warning('Character "%s" not supported, skipping.', ch);
        end
    end

    % Decode (nearest freq lookup)
    decodedMsg = "";
    for f = encodedFreqs
        [~, idx] = min(abs(freqs - f));
        decodedMsg = decodedMsg + charset(idx);
    end

    % Output
    out = sprintf('✅ Encoded: %s\n🎵 Freqs: %s\n🔓 Decoded: %s', ...
        msg, mat2str(encodedFreqs), decodedMsg);

    % Optional: play the audio (audible demo only)
    % sound(signal, fs);
end
