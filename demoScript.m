% Ultrasonic Digit Transmission Simulation
clear; clc; close all;

fs = 48000;              % Sampling frequency
T = 0.1;                 % Duration of each tone
t = 0:1/fs:T-1/fs;       % Time vector

% Static frequency mapping for digits 1–9
digitMap = containers.Map({'1','2','3','4','5','6','7','8','9'}, ...
    [19000 19250 19500 19750 20000 20250 20500 20750 21000]);

% Message to send
message = '45678';

signal = [];
for i = 1:length(message)
    freq = digitMap(message(i));
    tone = sin(2*pi*freq*t);
    signal = [signal tone];
end

% Play the signal
sound(signal, fs);

% Plot signal
figure;
plot(signal(1:2000));
title('Ultrasonic Signal (first 2000 samples)');

% Spectrum
figure;
n = length(signal);
f = (0:n-1)*(fs/n);
Y = abs(fft(signal));
plot(f, Y);
xlim([18000 22000]); % zoom near ultrasonic band
title('Spectrum of Ultrasonic Signal');
xlabel('Frequency (Hz)');
ylabel('Magnitude');
