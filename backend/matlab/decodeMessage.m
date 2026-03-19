function message = decodeMessage(binaryStr)

    % Ensure length is multiple of 8
    len = length(binaryStr);
    remainder = mod(len, 8);

    if remainder ~= 0
        binaryStr = binaryStr(1:end-remainder);
    end

    % Convert binary to characters
    bytes = reshape(binaryStr, 8, []).';
    asciiVals = bin2dec(bytes);
    message = char(asciiVals).';
end