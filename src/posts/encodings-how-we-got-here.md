---
title: "Unicode, How did we get here?"
excerpt: "Understanding color theory is crucial for creating harmonious designs. Let's explore the fundamentals..."
date: "2025-09-10"
readingTime: "15 min read"
slug: "encodings-how-we-got-here"
---

Questions to Answer:

1. What did we use before Baudot codes and why did we need it
   - talk about the invention of telegraphs and how communication was done using it. Also cite a small one liner example
   - talk about how the invention of the electromagnetic telegraph which uses morse code
   - talk about the flaws with the original which brought about many variations of the telegraph. Mention 
     a few and provide links as to why they didnt work
   - Then talk about the most important inovation of them all, which is the Baudot approach that used a 5-bit code system
2. Why the Baudot codes didnt workout(flaws with it) and the introduction of ASCII
    - Talk about how the baudot code used the 5-bit code system and how texts or messages were sent. Give a side by side example
     of sending a message using the baudot code and the original telegraph(using morse code)
    - Also show a simple table showing the baudot code encoding(or provide a link)
    - Talk about the flaws of baudot, which was issues with the shift state system.
    - Then give a brief summary of how IBM decided to have a much extended code system that did not use shift codes which resulted in 
      the birth of ASCII. Also state that ASCII did not start from scratch, they carried over some codes in morse code. might be nice to also show the ASCII
      encoding table here and how it uses only 7 bits
3. Limitations with ASCII and how multiple solutions came about.
    - Talk about the major ASCII limitation, which was not supporting non english or american characters and symbols leading to the extension by multiple 
     companies including windows(ANSI)
    - Also talk about the major pain point of having to deal with different ASCII extended encodings that made life difficult. cite some examples here.
    - Then talk about the introduction of the unicode(universal code) which meant to fix this issue.
4. Unicode, finally
     - Talk about how unicode extended the ASCII and provide a link to viewing the full encoding which supports emojis etc.
     - Also talk about the fact unicode used 16 bits, which as of now uses 24bits, bit however, the full representation fits into a 32-bit 
     - Now talk about the various representations of unicode(utf-8, utf-16, utf-32). Talk a bit about them and also mention the trade off. time vs space.
     - Give some use cases of when to use which representation and the state how much of the world (%) runs on utf-8, which fits every usecase.



> Most human beings have an almost infinite capacity for taking things for granted.
> - Aldous Huxley

Humans have notably been known for making life easier through innovation. One notable innovation was the telegraph originally invented by <insert name here> in <year>. This used [semaphores](https://en.wikipedia.org/wiki/Semaphore) on towers displaced between every 5 - 15km in an attempt to deliver messages faster than on horsebacks. This was a revolutional success at the time. The telegraphs made use of rods(relace this) which had a vertical and horizontal parts whose shape was changed or reconfigured into 98 different signals. The  Shape of the rod mapped to a specific number which was recorded in a code book. To send a message to the nearest tower, the two towers needed to have the same code book/manual for correctly encoding and decoding what numbers were presented by a tower. Each code book contained a number a bunch of text or expressions. So this provided a 2-step decoding/encoding process. 
This worked greatly. As a matter of fact, a message that would take 4 days to be delivered on horse back was cut down to just 2 hours. However, there were some limitations to using the optical telegraph. A few of which were:

1. The tower needed to be in sight.
2. It was manual and human required intensive. It also required that an operator needed to be checking the next tower
every 2 minutes.
3. The weather could impact visibility which meant an operator may find difficulty reading the signal of another tower
4. All towers needed to perform this in a timely synchronous manner.

## Morse code
Samuel Morse, just like other scientists in the 1800s researched ways to improve the flaws in the optical telegraph. His approach would later start the domino fall into series of innovations leading to the creation of mordern computers.
Morse used electromagnetism by using a circuit containing thin wire coils over a distance connected to a pen and a paper on the other end. The pen will then write short or long dashes controlled by the power source, which were then decoded into characters. The first successful public demonstration of the electromagnetic telegraph was in 1844, which sent a message betwwen Washington, D.C., and Baltimore, Maryland. This was a major success which human factor by a huge chunk.
NB(
    The human factor was still required since sending current over long distance often faced higher resistance, hence damping the signal. However, this was fixed using the relay systems that required a operator to receive a message and relay it to another operator. Much like that in the original approach but with less men
)

The Morse telegragph like its predecessor had limitations. It required special morse-trained operators to encode and decode messages which meant they couldnt be operated by just anyone. 
They were time based and impossible to use with teletypes/teleprinters, remote tele-typwriters which were meant to phase out the need for special morse-trained operators by allowing users to type actual texts in which the typewriters decoded messages automatically. The major issue teleprinters had with morse code was the inability to accurately distinguish short dashes from long dashes. NB(If you different operators had different lengths in dashes. One operator's short dash could be another's long dash). Morse code was "almost" binary where spaces or pauses were the third characters/determinants which made it difficult to use.


## Baudot Code
There were notably a number of telegraph inventions that came after the Morse telegraph seeking to improve the posed problems. A few of them include <mention them here>. Many of these innovations solved problems while simultaneously introducing another. However, Emile Baudot, an officer in the french telegraph service made a major breakthrough by solving the issues posed by the morse telegraph having used other telegraph types as inspiration. He invented the Baudot code which used a 5 bit system to encode messages. This tend to eleminate the inconsistencies the time-based morse telegraph had. It was much easier to predict the end of a code (since you only needed to read 5 bit everytime). There where only 32(2 ^5) possible codes and here's how the available codes corresponded to letters of the Alphabet:

| 5-bit (binary) |  Hex | Letter / Control        |
| -------------: | :--: | :---------------------- |
|          00000 | 0x00 | Blank / NUL             |
|          00001 | 0x01 | T                       |
|          00010 | 0x02 | CR (Carriage Return)    |
|          00011 | 0x03 | O                       |
|          00100 | 0x04 | Space                   |
|          00101 | 0x05 | H                       |
|          00110 | 0x06 | N                       |
|          00111 | 0x07 | M                       |
|          01000 | 0x08 | LF (Line Feed)          |
|          01001 | 0x09 | L                       |
|          01010 | 0x0A | R                       |
|          01011 | 0x0B | G                       |
|          01100 | 0x0C | I                       |
|          01101 | 0x0D | P                       |
|          01110 | 0x0E | C                       |
|          01111 | 0x0F | V                       |
|          10000 | 0x10 | E                       |
|          10001 | 0x11 | Z                       |
|          10010 | 0x12 | D                       |
|          10011 | 0x13 | B                       |
|          10100 | 0x14 | S                       |
|          10101 | 0x15 | Y                       |
|          10110 | 0x16 | F                       |
|          10111 | 0x17 | X                       |
|          11000 | 0x18 | A                       |
|          11001 | 0x19 | W                       |
|          11010 | 0x1A | J                       |
|          11011 | 0x1B | **FIGS** (Figure shift) |
|          11100 | 0x1C | U                       |
|          11101 | 0x1D | Q                       |
|          11110 | 0x1E | K                       |
|          11111 | 0x1F | **LTRS** (Letter shift) |


The baudot system initially did not support punctuations and numbers which was a major concern. To fix this, Baudot decided to make the code stateful by introducing 2 states, the figure shift(FIGS) and the Letter shift(LTRS) to help extend the use of same bits for different characters.

| 5-bit (binary) |  Hex | FIGS (numbers / punctuation / control) |
| -------------: | :--: | :------------------------------------- |
|          00000 | 0x00 | (BLANK / NUL)                          |
|          00001 | 0x01 | `3`                                    |
|          00010 | 0x02 | (LF — line feed)                       |
|          00011 | 0x03 | `-`                                    |
|          00100 | 0x04 | (space)                                |
|          00101 | 0x05 | (BEL — bell)                           |
|          00110 | 0x06 | `8`                                    |
|          00111 | 0x07 | `7`                                    |
|          01000 | 0x08 | (CR — carriage return)                 |
|          01001 | 0x09 | `$`                                    |
|          01010 | 0x0A | `4`                                    |
|          01011 | 0x0B | `'` (apostrophe)                       |
|          01100 | 0x0C | `,`                                    |
|          01101 | 0x0D | `!`                                    |
|          01110 | 0x0E | `:`                                    |
|          01111 | 0x0F | `(`                                    |
|          10000 | 0x10 | `5`                                    |
|          10001 | 0x11 | `"` (double quote)                     |
|          10010 | 0x12 | `)`                                    |
|          10011 | 0x13 | `2`                                    |
|          10100 | 0x14 | `#`                                    |
|          10101 | 0x15 | `6`                                    |
|          10110 | 0x16 | `0`                                    |
|          10111 | 0x17 | `1`                                    |
|          11000 | 0x18 | `9`                                    |
|          11001 | 0x19 | `?`                                    |
|          11010 | 0x1A | `&`                                    |
|          11011 | 0x1B | **FIGS** (shift to figures)            |
|          11100 | 0x1C | `.`                                    |
|          11101 | 0x1D | `/`                                    |
|          11110 | 0x1E | `;`                                    |
|          11111 | 0x1F | **LTRS** (shift to letters)            |


For example, the text "hello, world!" would be `05 10 09 09 03 1B 0C 04 1F 19 03 0A 09 12 1B 0D`.
As you can see, `05 10 09 09 03` represents "hello" and `1B` tells the decoder to treat everything else as a figure making `0C 04` correspond to `, ` and then `1F` tells the decoder to switch to letters again. `04 19 03 0A 09 12` denotes "world", `1B` switches to figures and then finally `0D` maps to `!`.

This seems fine for most cases, however, the baudot code also came with limitations. The use of shift states meant it was easy to forget a shift code which means the wrong character will be decoded. The Baudot code was also case insensitive and did not differentiate lowercase letters from uppercase letters.


## ASCII 
