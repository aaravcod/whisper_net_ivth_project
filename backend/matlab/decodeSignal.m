function decoded = decodeSignal(freqs)

    charset = ['A':'Z' 'a':'z' '0':'9' '|' ' ' '.' ',' '!' '?' '-' '_'];

    fStart = 18000;
    fStep = 100;

    decoded = "";

    for i = 1:length(freqs)

        f = freqs(i);

        idx = round((f - fStart)/fStep) + 1;

        if idx >= 1 && idx <= length(charset)

            decoded = decoded + charset(idx);

        else

            decoded = decoded + "?";

        end

    end

end