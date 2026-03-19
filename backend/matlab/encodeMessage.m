function encoded = encodeMessage(message)

    % 🔥 Convert full string to binary
    binary = reshape(dec2bin(uint8(message), 8).', 1, []);

    encoded = [];

    for i = 1:length(binary)
        bit = binary(i);

        if bit == '1'
            freq = 19000;
        else
            freq = 18000;
        end

        encoded = [encoded, freq];
    end
end