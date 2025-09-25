function out = ultrasonic_sim(msg)
    fs = 48000;
    T = 0.1;
    t = 0:1/fs:T-1/fs;

    digitMap = containers.Map({'1','2','3','4','5','6','7','8','9'}, ...
        [19000 19250 19500 19750 20000 20250 20500 20750 21000]);

    signal = [];
    for i = 1:length(msg)
        if isKey(digitMap, msg(i))
            freq = digitMap(msg(i));
            tone = sin(2*pi*freq*t);
            signal = [signal tone];
        end
    end

    out = sprintf('✅ Generated %d tones for message %s', length(msg), msg);
end
