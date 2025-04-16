-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 16, 2025 at 05:04 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `PluralGame`
--

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `gameid` int(11) NOT NULL,
  `guildid` tinytext NOT NULL,
  `channelid` tinytext NOT NULL,
  `hostid` tinytext NOT NULL,
  `startdate` datetime NOT NULL,
  `timers` tinyint(4) NOT NULL,
  `adult` tinyint(4) NOT NULL,
  `system` tinyint(4) DEFAULT NULL,
  `acceptplayers` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`gameid`, `guildid`, `channelid`, `hostid`, `startdate`, `timers`, `adult`, `system`, `acceptplayers`) VALUES
(141, '951181256253665300', '1305765025721352222', '214891261570580480', '2025-04-08 15:01:32', 0, 0, NULL, 1),
(142, '1113153962451943505', '1113153963521495194', '214891261570580480', '2025-04-14 21:55:52', 0, 0, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `gametracking`
--

CREATE TABLE `gametracking` (
  `qid` int(11) NOT NULL,
  `gameid` int(11) NOT NULL,
  `promptid` int(11) NOT NULL,
  `acceptresponses` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gametracking`
--

INSERT INTO `gametracking` (`qid`, `gameid`, `promptid`, `acceptresponses`) VALUES
(291, 141, 0, 1),
(292, 141, 0, 1),
(293, 141, 0, 1),
(294, 141, 0, 0),
(295, 141, 26, 1),
(296, 141, 60, 1),
(297, 141, 46, 1),
(298, 141, 6, 1),
(299, 141, 45, 1),
(300, 141, 43, 1),
(301, 141, 203, 1),
(302, 141, 166, 0),
(303, 142, 253, 0),
(304, 142, 151, 0),
(305, 142, 227, 1),
(306, 142, 149, 0),
(307, 142, 176, 0),
(308, 141, -1, 1),
(309, 141, -1, 1),
(310, 141, -1, 1),
(311, 141, -1, 0),
(312, 141, -1, 0),
(313, 141, -1, 0),
(314, 141, -1, 1),
(315, 141, -1, 1),
(316, 141, -1, 1),
(317, 141, -1, 1),
(318, 141, -1, 1),
(319, 141, -1, 1),
(320, 141, -1, 1),
(321, 141, -1, 1),
(322, 141, -1, 1),
(323, 141, -1, 0),
(324, 141, -1, 1),
(325, 141, -1, 1),
(326, 141, -1, 1),
(327, 141, -1, 1),
(328, 141, -1, 1),
(329, 141, -1, 1),
(330, 141, -1, 1),
(331, 141, -1, 1),
(332, 141, -1, 1),
(333, 141, -1, 1),
(334, 141, -1, 1),
(335, 141, 287, 1),
(336, 141, 328, 0);

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `gameid` int(11) NOT NULL,
  `channelid` tinytext NOT NULL,
  `guildid` tinytext NOT NULL,
  `playerid` int(11) NOT NULL,
  `playername` tinytext NOT NULL,
  `playeremoji` tinytext NOT NULL,
  `userid` tinytext NOT NULL,
  `points` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`gameid`, `channelid`, `guildid`, `playerid`, `playername`, `playeremoji`, `userid`, `points`) VALUES
(141, '1305765025721352222', '951181256253665300', 122, 'Jason', '⚡', '214891261570580480', 7),
(141, '1305765025721352222', '951181256253665300', 123, 'Sky', '🏙', '214891261570580480', 9),
(142, '1113153963521495194', '1113153962451943505', 124, 'Vox', '⚡', '214891261570580480', 0),
(142, '1113153963521495194', '1113153962451943505', 125, 'Val', '💞', '214891261570580480', 0),
(142, '1113153963521495194', '1113153962451943505', 126, 'Dan', '🧀', '764203383031988314', 19);

-- --------------------------------------------------------

--
-- Table structure for table `prompts`
--

CREATE TABLE `prompts` (
  `promptid` int(11) NOT NULL,
  `gamemode` int(11) NOT NULL,
  `prompt` text NOT NULL,
  `answer` text DEFAULT NULL,
  `adult` tinyint(4) NOT NULL,
  `system` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prompts`
--

INSERT INTO `prompts` (`promptid`, `gamemode`, `prompt`, `answer`, `adult`, `system`) VALUES
(1, 1, 'sell their soul', NULL, 0, 0),
(2, 1, 'kin a new source', NULL, 0, 0),
(3, 1, 'lick a rock', NULL, 0, 0),
(4, 1, 'help hide a body', NULL, 0, 0),
(5, 1, 'need help hiding a body', NULL, 0, 0),
(6, 1, 'survive on a deserted island', NULL, 0, 0),
(7, 1, 'adopt a zoo animal', NULL, 0, 0),
(8, 1, 'forget a birthday', NULL, 0, 0),
(9, 1, 'dissociate', NULL, 0, 0),
(10, 1, 'sleep through an earthquake', NULL, 0, 0),
(11, 1, 'forget to eat', NULL, 0, 0),
(12, 1, 'eat pineapple on pizza', NULL, 0, 0),
(13, 1, 'become an internet meme', NULL, 0, 0),
(14, 1, 'become the conspiracy theory friend', NULL, 0, 0),
(15, 1, 'take one for the team and front in order to Actually Get Shit Done', NULL, 0, 0),
(16, 1, 'get a speeding ticket', NULL, 0, 0),
(17, 1, 'die first in a horror movie', NULL, 0, 0),
(18, 1, 'make 300 playlists about pre-system life', NULL, 0, 0),
(19, 1, 'Commit Crimes', NULL, 0, 0),
(20, 1, 'fake their own death', NULL, 0, 0),
(21, 1, 'win a staring contest', NULL, 0, 0),
(22, 1, 'break a world record for most selfies in under 3 minutes', NULL, 0, 0),
(23, 1, 'bite someone', NULL, 0, 0),
(24, 1, 'win this game', NULL, 0, 0),
(25, 1, 'forget their PK/tupper proxy', NULL, 0, 0),
(26, 1, 'survive a zombie apocalypse', NULL, 0, 0),
(27, 1, 'start a fight', NULL, 0, 0),
(28, 1, 'lose a fight', NULL, 0, 0),
(29, 1, 'win a fight', NULL, 0, 0),
(30, 1, 'keep a secret', NULL, 0, 0),
(31, 1, 'not keep a secret', NULL, 0, 0),
(32, 1, 'accidentally say \'we\' instead of \'I\'', NULL, 0, 0),
(33, 1, 'make dad jokes', NULL, 0, 0),
(34, 1, 'know all the words to Never Gonna Give You Up', NULL, 0, 0),
(35, 1, 'get away with murder', NULL, 0, 0),
(36, 1, 'fall for an internet scam', NULL, 0, 0),
(37, 1, 'get roped into a pyramid scheme', NULL, 0, 0),
(38, 1, 'eat something off the ground', NULL, 0, 0),
(39, 1, 'summon a demon', NULL, 0, 0),
(40, 1, 'build a nuclear reactor in their garage', NULL, 0, 0),
(41, 1, 'fall down the stairs', NULL, 0, 0),
(42, 1, 'forget their own birthday', NULL, 0, 0),
(43, 1, 'start a fire while cooking', NULL, 0, 0),
(44, 1, 'cry at Hallmark movies', NULL, 0, 0),
(45, 1, 'cry at commercials', NULL, 0, 0),
(46, 1, 'bribe other system-members into doing chores', NULL, 0, 0),
(47, 1, 'be bribed into doing chores', NULL, 0, 0),
(48, 1, 'rob a bank', NULL, 0, 0),
(49, 1, 'sing in the shower', NULL, 0, 0),
(50, 1, 'pull an all-nighter', NULL, 0, 0),
(51, 1, '(insects) ||eat a bug||', NULL, 0, 0),
(52, 1, 'steal something', NULL, 0, 0),
(53, 1, 'pass out on a rollercoaster', NULL, 0, 0),
(54, 1, 'pack-bond with the roomba', NULL, 0, 0),
(55, 1, 'get stuck in headspace', NULL, 0, 0),
(56, 1, 'overthink Absolutely Everything', NULL, 0, 0),
(57, 1, 'drink so much caffeine they can taste colors', NULL, 0, 0),
(58, 1, 'deep-clean the whole house at midnight', NULL, 0, 0),
(59, 1, 'give up and move to Florida', NULL, 0, 0),
(60, 1, 'accidentally join a cult', NULL, 0, 0),
(61, 1, 'dye their hair', NULL, 0, 0),
(62, 1, 'be just a Little Problematic:tm:', NULL, 0, 0),
(63, 1, 'go viral for doing TikTok dances', NULL, 0, 0),
(64, 1, 'be perfect and never make mistakes ever', NULL, 0, 0),
(65, 1, 'go to hell (this one could be hilarious or need to be skipped depending on who\'s playing lmao)', NULL, 0, 0),
(66, 1, 'lick things to claim them as their own', NULL, 0, 0),
(67, 1, 'become Fandom Popular:tm:', NULL, 0, 0),
(73, 3, '@\'s hilarious new TV show: ___!', NULL, 0, 0),
(74, 3, 'Coming soon: ___, a novel by @!', NULL, 0, 0),
(75, 3, '@\'s favorite curse word: ___!', NULL, 0, 0),
(76, 3, '@\'s worst nightmare: ___!', NULL, 0, 0),
(77, 3, '@\'s beauty, @\'s grace, @\'s ___!', NULL, 0, 0),
(78, 3, 'A toast to love, peace, and @\'s ___.', NULL, 0, 0),
(79, 3, 'What did @ get cancelled for?', NULL, 0, 0),
(80, 3, 'What does @ do really well?', NULL, 0, 0),
(81, 3, 'Why would @ go to hell?', NULL, 0, 0),
(82, 3, '@ gets all their serotonin from ___.', NULL, 0, 0),
(83, 3, 'Well, @ has developed a fandom for ___, apparently.', NULL, 0, 0),
(84, 3, 'What is @ doing at 3AM?', NULL, 0, 0),
(85, 3, 'What would @ write a 190k fanfic about on AO3?', NULL, 0, 0),
(86, 3, '@\'s DNA test shows they\'re 100% ___.', NULL, 0, 0),
(87, 3, '@ loves ___.', NULL, 0, 0),
(88, 3, 'What is @ worst at?', NULL, 0, 0),
(89, 3, 'What is @ best at?', NULL, 0, 0),
(90, 3, '@\'s idea of the end of the world is ___.', NULL, 0, 0),
(91, 3, 'What does @ do to express normal healthy human love?', NULL, 0, 0),
(92, 3, '@ achieves their dream by ___!', NULL, 0, 0),
(93, 3, '@\'s wild alien encounter involves ___.', NULL, 0, 0),
(94, 3, '@\'s pathetic snack is ___.', NULL, 0, 0),
(95, 3, '@\'s role in the school play is ___.', NULL, 0, 0),
(97, 3, 'What does @ do when thrown in the middle of the dance circle?', NULL, 0, 0),
(98, 3, 'What\'s @ idea of a romantic gesture?', NULL, 0, 0),
(99, 3, 'How does @ like their coffee?', NULL, 0, 0),
(100, 3, 'What is @ singing in the shower?', NULL, 0, 0),
(101, 3, 'What is the first thing @ does in the morning?', NULL, 0, 0),
(103, 3, 'What does @ do while lucid dreaming?', NULL, 0, 0),
(104, 3, 'Why is @ busy right now?', NULL, 0, 0),
(105, 3, '@\'s most important achievement is ___!', NULL, 0, 0),
(106, 3, 'Maybe @\'s born with it, maybe it\'s ___.', NULL, 0, 0),
(107, 3, '@\'s wildest Friday night is ___.', NULL, 0, 0),
(108, 3, 'How does @ maintain such a healthy glow?', NULL, 0, 0),
(109, 3, '@ can\'t leave the house without ___.', NULL, 0, 0),
(110, 3, 'What keeps @ up at night?', NULL, 0, 0),
(111, 3, 'What is @\'s general vibe?', NULL, 0, 0),
(112, 3, 'What is @ arguing about on the internet?', NULL, 0, 0),
(113, 3, 'What is @ doing in the apocalypse?', NULL, 0, 0),
(114, 3, 'What is @\'s desire for a better world?', NULL, 0, 0),
(115, 3, 'Why is @ getting up early?', NULL, 0, 0),
(116, 3, '@\'s most toxic trait? ___.', NULL, 0, 0),
(117, 3, '@\'s most recent search history listing: ___.', NULL, 0, 0),
(118, 3, 'Oh, @\'s infodumping about ___ again!', NULL, 0, 0),
(119, 3, 'Why is @ giving up and moving to Florida?', NULL, 0, 0),
(120, 3, 'What made @ accidentally join a cult?', NULL, 0, 0),
(121, 3, '@ faked their own death by ___.', NULL, 0, 0),
(122, 3, 'Why would @ have their own fandom?', NULL, 0, 0),
(123, 3, 'Why did @ sell their soul?', NULL, 0, 0),
(125, 3, 'What crimes has @ committed now??', NULL, 0, 0),
(126, 3, 'Why did @ start a fight?', NULL, 0, 0),
(127, 3, 'How does @ get away with murder?', NULL, 0, 0),
(128, 3, '@\'s mortal enemy: ___!', NULL, 0, 0),
(129, 3, 'What is @\'s newest hyperfixation?', NULL, 0, 0),
(130, 3, '___? Hottest thing about @.', NULL, 1, 0),
(131, 3, 'How would @ die in a horror movie?', NULL, 0, 0),
(132, 3, '@\'s sexiest trait: ___.', NULL, 1, 0),
(133, 1, 'get arrested', NULL, 0, 0),
(134, 1, 'drop something on the floor and still eat it', NULL, 0, 0),
(135, 1, 'give the best advice', NULL, 0, 0),
(136, 1, 'eat another system-member\'s food', NULL, 0, 1),
(137, 1, 'get a speeding ticket', NULL, 0, 0),
(138, 1, 'get locked out of the house', NULL, 0, 0),
(139, 3, 'What is @\'s guilty pleasure?', NULL, 0, 0),
(140, 3, '@\'s greatest superpower: ___!', NULL, 0, 0),
(141, 3, 'Just released: ___, a song by @!', NULL, 0, 0),
(142, 3, '@\'s in the news! What\'s the headline?', NULL, 0, 0),
(143, 3, 'If @ had their own talk show, their first guest would be ___.', NULL, 0, 0),
(144, 3, '@ won a Nobel prize for ___!', NULL, 0, 0),
(145, 2, 'What is the most important milestone of this century?', NULL, 0, 0),
(146, 2, 'Goodnight to everyone except ___.', NULL, 0, 0),
(147, 2, '___? CANCELLED.', NULL, 0, 0),
(148, 2, 'I may be small, and I may be weak, but at least I have ___.', NULL, 0, 0),
(149, 2, 'What sounds nice on paper but is awful in real life?', NULL, 0, 0),
(150, 2, '___, my biggest life aspiration.', NULL, 0, 0),
(151, 2, 'I knew about ___ before it was cool!', NULL, 0, 0),
(152, 2, 'And it all went downhill after ___.', NULL, 0, 0),
(153, 2, 'One thing you can never change my mind about is ___!', NULL, 0, 0),
(154, 2, 'The one thing I\'d give a TED talk about is ___.', NULL, 0, 0),
(155, 2, 'DNI if you are: >18, a TERF, a fascist, or ___!', NULL, 0, 0),
(156, 2, 'What sent me to hell?', NULL, 0, 0),
(157, 2, 'The secret to happiness is ___.', NULL, 0, 0),
(158, 2, 'True chaos is ___.', NULL, 0, 0),
(159, 2, 'I get all my serotonin from ___.', NULL, 0, 0),
(160, 2, 'The newest thing being killed by millenials: ___.', NULL, 0, 0),
(161, 2, 'Well, ___ has developed a fandom, apparently.', NULL, 0, 0),
(162, 2, 'You have committed crimes against Skyrim and her people! What say you in your defense?', NULL, 0, 0),
(163, 2, '3AM... Time to ___.', NULL, 0, 0),
(164, 2, 'Gays can only do one: drive, do math, or ___.', NULL, 0, 0),
(165, 2, 'What\'s my gender?', NULL, 0, 0),
(166, 2, 'That\'s it, I\'m launching ___ into the sun.', NULL, 0, 0),
(167, 2, 'What\'s that sound?', NULL, 0, 0),
(168, 2, 'What are you thankful for?', NULL, 0, 0),
(169, 2, 'If you didn\'t want a 30-minute rant, you shouldn\'t have mentioned ___!', NULL, 0, 0),
(170, 2, 'I get by with a little help from ___.', NULL, 0, 0),
(171, 2, 'What\'s the gay agenda?', NULL, 0, 0),
(172, 2, 'This is the prime of my life. I\'m young, hot, and full of ___.', NULL, 0, 0),
(173, 2, 'Future historians will agree that ___ marked the beginning of the USA\'s decline.', NULL, 0, 0),
(174, 2, 'If at first you don\'t succeed, try ___.', NULL, 0, 0),
(175, 2, 'Money can\'t buy me love, but it *can* buy me ___.', NULL, 0, 0),
(176, 2, 'My plan for world domination begins with ___.', NULL, 0, 0),
(177, 2, 'Only two things in life are certain: death and ___.', NULL, 0, 0),
(178, 2, 'Science will never explain ___.', NULL, 0, 0),
(179, 2, 'What\'s the next superhero?', NULL, 0, 0),
(180, 2, 'Why can\'t I sleep at night?', NULL, 0, 0),
(181, 2, '___? No.', NULL, 0, 0),
(182, 2, 'All I want for the holidays is ___!', NULL, 0, 0),
(183, 2, 'Anyone can dance! Just throw your hands I the air and pretend you’re ___!', NULL, 0, 0),
(184, 2, 'It\'s just you, me, and ___ now.', NULL, 0, 0),
(185, 2, 'The aliens are here. They want ___.', NULL, 0, 0),
(186, 2, 'What pairs best with peanut butter?', NULL, 0, 0),
(187, 2, 'Now introducing: a sommelier for ___!', NULL, 0, 0),
(188, 2, 'Time to put on my favorite t-shirt, the one that says \'I 🖤 ___.\'', NULL, 0, 0),
(189, 2, 'What really killed the dinosaurs?', NULL, 0, 0),
(190, 2, 'It\'s all fun and games until ___!', NULL, 0, 0),
(191, 2, 'When I look in the mirror, I see ___.', NULL, 0, 0),
(192, 2, 'You\'re grounded! No ___ for a whole week.', NULL, 0, 0),
(193, 2, 'That\'s it! I\'m going to the one place uncorrupted by capitalism! ___!', NULL, 0, 0),
(194, 2, 'Here\'s something I learned in business school: the customer is always ___!', NULL, 0, 0),
(195, 2, 'My love language is ___.', NULL, 0, 0),
(196, 2, 'Alright! Answered two whole emails. Time to reward myself with ___.', NULL, 0, 0),
(197, 2, 'Hello, I\'m Mark Zuckerberg. Welcome to The Metaverse, where you can experience ___ like never before.', NULL, 0, 0),
(198, 2, 'I\'m afraid your college application needs some work. ___ is not an extracurricular activity.', NULL, 0, 0),
(199, 2, 'My friend and I saw you across the bar, and we love your vibe. Would you be interested in _______?', NULL, 0, 0),
(200, 2, 'Nah, I don\'t mess with ___.', NULL, 0, 0),
(201, 2, 'Welcome to the world\'s spookiest haunted house! We\'ve got thrills! We\'ve got chills! We\'ve got ___!', NULL, 0, 0),
(202, 2, 'Scientists discovered the fifth dimension, and it\'s ___.', NULL, 0, 0),
(203, 2, '___ is back! Only at McDonald\'s.', NULL, 0, 0),
(204, 2, 'I\'ll never be the same after ___.', NULL, 0, 0),
(205, 2, 'After months of practice, I think I\'m finally ready for ___.', NULL, 0, 0),
(206, 2, 'Damn it, you can\'t just solve every problem with ___!', NULL, 0, 0),
(207, 2, 'What\'s a solution to all of humanity\'s problems?', NULL, 0, 0),
(208, 2, 'In the end, the dragon wasn\'t evil. He just wanted ___.', NULL, 0, 0),
(209, 2, 'Critics are raving about the new fantasy series ___!', NULL, 0, 0),
(210, 2, '___ is OP. Please nerf.', NULL, 0, 0),
(211, 2, 'Achievement unlocked: ___!', NULL, 0, 0),
(212, 2, 'Press ↓ ↓ ← → B to unleash ___!', NULL, 0, 0),
(213, 2, 'What made me cry?', NULL, 0, 0),
(214, 2, '*LUKE, I AM YOUR ___!*', NULL, 0, 0),
(215, 2, 'The fault, dear Brutus, is not in our stars, but in ___.', NULL, 0, 0),
(216, 2, 'What\'s the truth?', NULL, 0, 0),
(217, 2, 'Before the Big Bang, there was ___.', NULL, 0, 0),
(218, 2, 'Today on Mythbusters: ___!', NULL, 0, 0),
(219, 2, 'We\'re here! We\'re ___! Get used to it!', NULL, 0, 0),
(220, 2, 'Hallmark has invented a new holiday. It\'s called ___!', NULL, 0, 0),
(221, 2, 'Roses are red, violets are blue, ___ is sweet, and so are you.', NULL, 0, 0),
(222, 2, 'Time is an illusion, and so is ___.', NULL, 0, 0),
(223, 2, 'You want ___? You can\'t handle it!', NULL, 0, 0),
(224, 2, 'I\'m not going to lie. I despise ___. There, I said it.', NULL, 0, 0),
(225, 2, 'Hey, you guys want to try this awesome new game? It’s called ___!', NULL, 0, 0),
(226, 2, '___. This changes everything.', NULL, 0, 0),
(227, 2, 'In case of emergency, call ___.', NULL, 0, 0),
(228, 2, 'Why didn\'t I show up for work?', NULL, 0, 0),
(229, 2, '___ is coming! Run for your life!', NULL, 0, 0),
(230, 2, 'Might fuck around and ___.', NULL, 1, 0),
(231, 2, 'I don\'t care what a person looks like. As long as they\'re ___, I\'ll fuck them.', NULL, 1, 0),
(232, 2, 'Subscribe to my OnlyFans for daily pictures of ___!', NULL, 1, 0),
(233, 2, 'Sure, sex is great, but have you tried ___?', NULL, 1, 0),
(234, 2, 'When all else fails, I can always masturbate to ___.', NULL, 1, 0),
(235, 2, 'How did I lose my virginity?', NULL, 1, 0),
(236, 2, 'Fun tip! When your partner asks you to go down on them, try surprising them with ___ instead.', NULL, 1, 0),
(237, 2, 'The best part of being a system is ___.', NULL, 0, 1),
(238, 2, 'The worst part of being a system is ___.', NULL, 0, 1),
(239, 2, 'I swear I get a new headmate every time I ___.', NULL, 0, 1),
(240, 2, 'You can\'t do ___! We share a body!', NULL, 0, 1),
(241, 2, 'If we didn\'t share a body, I would absolutely be ___ right now.', NULL, 0, 1),
(242, 2, 'Don\'t front right now, I\'m ___.', NULL, 0, 1),
(243, 2, 'It\'s all fun and games until someone introjects ___!', NULL, 0, 1),
(244, 2, 'Before we figured out we\'re plural, we really thought we were ___.', NULL, 0, 1),
(245, 2, 'pk;m new ___', NULL, 0, 1),
(246, 2, 'My strongest front trigger? ___.', NULL, 0, 1),
(247, 2, 'People think being a system is this big scary thing, when really it\'s ___.', NULL, 0, 1),
(248, 2, 'What trouble did I get into last time I was fronting?', NULL, 0, 1),
(249, 2, 'What\'s the most inconvenient time to switch?', NULL, 0, 1),
(251, 2, 'The one thing that always makes me dissociate is ___.', NULL, 0, 0),
(252, 2, 'How dissociated am I? Well, ___!', NULL, 0, 0),
(253, 2, 'Nothing kicks off the anxiety quite like ___!', NULL, 0, 0),
(254, 3, 'What got @ into trouble last time they were fronting?', NULL, 0, 1),
(255, 2, 'What got @ into trouble last time they were fronting?', NULL, 0, 1),
(256, 2, 'The most embarrassing crime to get caught comitting:', NULL, 0, 0),
(257, 2, 'The worst Halloween costume:', NULL, 0, 0),
(258, 2, 'The best way to blow a million dollars:', NULL, 0, 0),
(259, 2, 'The one thing the NSA is tired of watching us type into Google:', NULL, 0, 0),
(260, 2, 'The worst thing to find frozen in an ice cube:', NULL, 0, 0),
(263, 2, 'What two words would passengers never want to hear a pilot say?', NULL, 0, 0),
(264, 2, 'The secret to a happy life:', NULL, 0, 0),
(266, 2, 'What bears dream about all winter:', NULL, 0, 0),
(268, 2, 'A strange thing to keep as a pet:', NULL, 0, 0),
(269, 2, 'In 25 years, people will look back and think we\'re morons for not realizing that ___!', NULL, 0, 0),
(270, 2, 'What will be the hot new fashion trend in 2050?', NULL, 0, 0),
(271, 2, 'In the future, robots will do everything for us except ___.', NULL, 0, 0),
(272, 2, 'What you wish you could say to yourself as a high schooler:', NULL, 0, 0),
(273, 2, 'A terrible thing to carve into a tree:', NULL, 0, 0),
(274, 2, 'The worst curse: every full moon you turn into:', NULL, 0, 0),
(275, 2, 'A good sign that your house is haunted:', NULL, 0, 0),
(276, 2, 'A weird plan for saving the manatees:', NULL, 0, 0),
(277, 2, 'The name of a really crappy robot:', NULL, 0, 0),
(278, 2, 'You know you have a shady landlord when:', NULL, 0, 0),
(279, 2, 'The worst Vegas casino: ___ Palace', NULL, 1, 0),
(280, 2, 'The unsexiest thought you can have:', NULL, 1, 0),
(281, 2, 'An adult version of any classic video game:', NULL, 1, 0),
(327, 4, 'What are the three starter Pokémon available in Pokémon Black and White?', 'Snivy, Tepig, Oshawott', 0, 0),
(328, 4, 'According to Toby Fox, what was the method to creating the initial tune for Megalovania?', 'Singing into a microphone', 0, 0),
(329, 4, 'In the Netflix show *Stranger Things,* what song would Will sing to himself as he was missing?', 'Should I Stay or Should I Go?', 0, 0),
(330, 4, 'What is Lilo\'s last name from *Lilo and Stitch?*', 'Pelekai', 0, 0),
(331, 4, 'Who is the half-demon character in Divinity: Original Sin 2 who you talk to to transition between acts?', 'Malady', 0, 0),
(332, 4, 'In JoJo\'s Bizarre Adventure, which character is able to accelerate time?', 'Enrico Pucci', 0, 0),
(333, 4, 'In Marvel Comics, Taurus is the founder and leader of which criminal organization?', NULL, 0, 0),
(334, 4, 'Which major extinction event was caused by an asteroid collision and eliminated the majority of non-avian dinosaurs?', 'Cretaceous-Paleogene', 0, 0),
(335, 4, 'In the webcomic *Homestuck,* what is the name of the game the four kids play?', 'Sburb', 0, 0),
(336, 4, 'In Roman numerals, what does \'XL\' equate to?', '40', 0, 0),
(337, 4, 'What does the term GPU stand for?', 'Graphical Processing Unit', 0, 0),
(338, 4, 'What is the name of the world that the MMO *Runescape* takes place in?', 'Gielinor', 0, 0),
(339, 4, 'What was the world\'s first handheld game device?', 'Mattel Auto Race', 0, 0),
(340, 4, 'What does VR stand for?', 'Virtual Reality', 0, 0),
(341, 4, 'What zodiac sign is represented by a pair of scales?', 'Libra', 0, 0),
(342, 4, 'In the game *Overwatch,* what are the names of the two Australian criminals from the Junkers faction?', 'Junkrat and Roadhog', 0, 0),
(343, 4, 'Who is the creator of the Touhou Project series?', 'ZUN', 0, 0),
(344, 4, 'What is Brian May\'s guitar called?', 'Red Special', 0, 0),
(345, 4, 'Which type of rock is created by intense heat and pressure?', 'Metamorphic', 0, 0),
(346, 4, 'What prime number comes next after 19?', '23', 0, 0),
(347, 4, 'In *Yu-Gi-Oh,* how does a player perform an Xyz Summon?', 'Overlay at least 2 Monsters of the same level', 0, 0),
(348, 4, 'Who is the founder of *Team Fortress\'s* fictional company Mann Co.?', 'Zepheniah Mann', 0, 0),
(349, 4, 'What is the collective noun for bears?', 'Sloth', 0, 0),
(350, 4, '\'The Potato Sack\' was a collection of games released on Steam in 2011 as a promotion for what game?', 'Portal 2', 0, 0),
(351, 4, 'In *Five Nights at Freddy\'s 1*, how can you make Golden Freddy disappear?', 'Enable cameras', 0, 0),
(352, 4, 'What is the name of the main protagonist in *Xenoblade Chronicles*?', 'Shulk', 0, 0),
(353, 4, 'In the video game *League of Legends,* which character is known as \'The Sinister Blade\'?', 'Katarina', 0, 0),
(354, 4, 'In hexadecimal, what color would be displayed from the color code *#00FF00*?', 'Green', 0, 0),
(355, 4, 'What manufacturer made the car used in Back to the Future?', 'DeLorean', 0, 0),
(356, 4, 'In *Portal,* what color is the Morality Core?', 'Purple', 0, 0),
(357, 4, 'What are the cylinder-like parts that pump up and down within an engine?', 'Pistons', 0, 0),
(358, 4, 'What is the name of the island that *Jurassic Park* is built on?', 'Isla Nublar', 0, 0),
(359, 4, 'In *Super Mario RPG: Legend of the Seven Stars,* what is Geno\'s real name?', '♡♪!?', 0, 0),
(360, 4, 'What polymer is used to make CDs, safety goggles, and riot shields?', 'Polycarbonate', 0, 0),
(361, 4, 'In *Animal Crossing,* which character uses the phrase \'zip zoom\' when talking to the player?', 'Scoot', 0, 0),
(362, 4, 'In *Final Fantasy VI*, what is the name of (summoned) Gilgamesh\'s weakest attack?', 'Excalipoor', 0, 0),
(363, 4, 'Which element has the chemical symbol Fe?', 'Iron', 0, 0),
(364, 4, 'What major event caused the events of the video game *Half-Life 1*?', 'The Resonance Cascade', 0, 0),
(365, 4, 'What does LASER stand for?', 'Light amplification by stimulated emission of radiation', 0, 0),
(366, 4, 'In the video game *Half-Life,* which enemy is showcased as the final boss?', 'The Nihilanth', 0, 0),
(367, 4, 'In chess, what is the first move of the King\'s Gambit?', 'Moving the king\'s pawn forward two spaces', 0, 0),
(368, 4, 'What is the fastest land animal?', 'Cheetah', 0, 0),
(369, 4, 'What state was the company Apple formed in?', 'California', 0, 0),
(370, 4, 'What state was the company Microsoft formed in?', 'New Mexico', 0, 0),
(371, 4, 'What five-letter word is the motto of the IBM Computer Company?', 'Think', 0, 0),
(372, 4, 'In *Star Trek,* what is Captain James T. Kirk\'s middle name?', 'Tiberius', 0, 0),
(373, 4, '*Green Eggs and Ham* is a book by which author?', 'Dr. Seuss', 0, 0),
(374, 4, 'What is the \'powerhouse\' of a eukaryotic cell?', 'Mitochondria', 0, 0),
(375, 4, 'In the *Kingdom Hearts* franchise, the main protagonist carries a weapon in the shape of what?', 'A key', 0, 0),
(376, 4, 'In *Big Hero 6,* what were Baymax\'s motions modeled after?', 'Baby penguins', 0, 0),
(377, 4, 'What is the name of the stuffed lion in Bleach?', 'Kon', 0, 0),
(378, 4, 'How much horsepower is produced by the SD40-2 Locomotive?', '3,000', 0, 0),
(379, 4, 'In *Star Trek,* what is the name of Spock\'s father?', 'Sarek', 0, 0),
(380, 4, 'Who is the main antagonist of *Ori and the Blind Forest?*', 'Kuro', 0, 0),
(381, 4, 'What is the title of the first .hack video game?', './hack//Infection', 0, 0),
(382, 4, 'Before Super Smash Bros. contained Nintendo characters, what was it known as internally?', 'Dragon King: The Fighting Game', 0, 0),
(383, 4, 'What was the name of the Mysterious Island in Jules Verne\'s *The Mysterious Island?*', 'Lincoln Island', 0, 0),
(384, 4, 'What is the planet closest to our solar system\'s sun?', 'Mercury', 0, 0),
(385, 4, 'In *Team Fortress 2*, what code does Soldier put into the door keypad in \'Meet the Spy\'?', '1111', 0, 0),
(386, 4, 'What\'s the name of the protagonist in the Legend of Zelda franchise?', 'Link', 0, 0),
(387, 4, 'What programming language was used to create the game *Minecraft*?', 'Java', 0, 0),
(388, 4, 'In *Team Fortress 2,* what are the names of the Heavy\'s younger sisters?', 'Yana and Bronislava', 0, 0),
(389, 4, 'In the *Portal* series, who was Cave Johnson\'s personal assistant?', 'Caroline', 0, 0),
(390, 4, 'How many bones does a shark have?', 'None', 0, 0),
(391, 4, 'What color is the \'black box\' on an airplane?', 'Orange', 0, 0),
(392, 4, 'What was the tiny pocket in jeans originally designed for?', 'Pocket watches', 0, 0),
(393, 4, 'Which flavor corresponds to which color of Froot Loops?', 'Trick question! They\'re all the same flavor.', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `responses`
--

CREATE TABLE `responses` (
  `qid` int(11) NOT NULL,
  `gameid` int(11) NOT NULL,
  `playerid` int(11) NOT NULL,
  `playername` tinytext NOT NULL,
  `response` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `responses`
--

INSERT INTO `responses` (`qid`, `gameid`, `playerid`, `playername`, `response`) VALUES
(291, 141, 122, 'Jason', '1&&&2&&&3'),
(291, 141, 123, 'Sky', '1&&&2&&&3'),
(293, 141, 122, 'Jason', '1&&&2&&&3'),
(293, 141, 123, 'Sky', '1&&&2&&&3'),
(294, 141, 122, 'Jason', '1&&&2&&&3'),
(294, 141, 123, 'Sky', '4&&&5&&&6'),
(301, 141, 122, 'Jason', '1'),
(301, 141, 123, 'Sky', '2'),
(302, 141, 123, 'Sky', '2'),
(302, 141, 122, 'Jason', '1'),
(303, 142, 124, 'Vox', 'this fucking text conversation about Thursday'),
(303, 142, 126, 'Dan', 'Tuesday\'s Scheduled Tornado'),
(303, 142, 125, 'Val', 'aaaaaaaaaaaaa'),
(304, 142, 124, 'Vox', 'aaaaaaaa'),
(304, 142, 125, 'Val', 'aaaaaaaaaaaaaa'),
(304, 142, 126, 'Dan', 'Critically acclaimed fanfiction Chess and Language'),
(305, 142, 124, 'Vox', 'not me'),
(305, 142, 125, 'Val', 'banana phooooooooone'),
(305, 142, 126, 'Dan', 'Call :) yay'),
(306, 142, 124, 'Vox', 'coding game bots'),
(306, 142, 126, 'Dan', 'ROMANTIC RELATIONSHIPS SEND TWEET'),
(306, 142, 125, 'Val', 'aaaaaaaaaaaaa'),
(307, 142, 124, 'Vox', 'who knows'),
(307, 142, 125, 'Val', 'aaaaaaaaaaaa'),
(307, 142, 126, 'Dan', 'idk but half my friends are evil scientists'),
(309, 141, 123, 'Sky', '1'),
(309, 141, 122, 'Jason', '2'),
(310, 141, 123, 'Sky', '1'),
(310, 141, 122, 'Jason', '2'),
(311, 141, 123, 'Sky', '1'),
(311, 141, 122, 'Jason', '2'),
(312, 141, 122, 'Jason', '1'),
(312, 141, 123, 'Sky', '2'),
(313, 141, 123, 'Sky', '1'),
(313, 141, 122, 'Jason', '2'),
(323, 141, 122, 'Jason', '1'),
(323, 141, 123, 'Sky', '2'),
(336, 141, 123, 'Sky', '1'),
(336, 141, 122, 'Jason', '2');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`gameid`);

--
-- Indexes for table `gametracking`
--
ALTER TABLE `gametracking`
  ADD PRIMARY KEY (`qid`);

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`playerid`);

--
-- Indexes for table `prompts`
--
ALTER TABLE `prompts`
  ADD PRIMARY KEY (`promptid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `gameid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;

--
-- AUTO_INCREMENT for table `gametracking`
--
ALTER TABLE `gametracking`
  MODIFY `qid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=337;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `playerid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `prompts`
--
ALTER TABLE `prompts`
  MODIFY `promptid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=394;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
