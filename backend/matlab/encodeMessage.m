function [encodedFreqs, signal] = encodeMessage(msg)

    fs = 48000;
    T = 0.05;
    t = 0:1/fs:T-1/fs;

    charset = ['A':'Z' 'a':'z' '0':'9' '|' ' ' '.' ',' '!' '?' '-' '_'];

    fStart = 18000;
    fStep = 100;

    encodedFreqs = [];
    signal = [];

    for i = 1:length(msg)

        ch = msg(i);
        idx = find(charset == ch);

        if isempty(idx)
            warning("Unsupported character: %s", ch);
            continue
        end

        freq = fStart + (idx-1)*fStep;

        tone = sin(2*pi*freq*t);

        encodedFreqs = [encodedFreqs freq];
        signal = [signal tone];

    end

end