-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 07, 2025 at 09:03 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `prompts`
--

CREATE TABLE `prompts` (
  `promptid` int(11) NOT NULL,
  `gamemode` int(11) NOT NULL,
  `prompt` text NOT NULL,
  `adult` tinyint(4) NOT NULL,
  `system` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prompts`
--

INSERT INTO `prompts` (`promptid`, `gamemode`, `prompt`, `adult`, `system`) VALUES
(1, 1, 'sell their soul', 0, 0),
(2, 1, 'kin a new source', 0, 0),
(3, 1, 'lick a rock', 0, 0),
(4, 1, 'help hide a body', 0, 0),
(5, 1, 'need help hiding a body', 0, 0),
(6, 1, 'survive on a deserted island', 0, 0),
(7, 1, 'adopt a zoo animal', 0, 0),
(8, 1, 'forget a birthday', 0, 0),
(9, 1, 'dissociate', 0, 0),
(10, 1, 'sleep through an earthquake', 0, 0),
(11, 1, 'forget to eat', 0, 0),
(12, 1, 'eat pineapple on pizza', 0, 0),
(13, 1, 'become an internet meme', 0, 0),
(14, 1, 'become the conspiracy theory friend', 0, 0),
(15, 1, 'take one for the team and front in order to Actually Get Shit Done', 0, 0),
(16, 1, 'get a speeding ticket', 0, 0),
(17, 1, 'die first in a horror movie', 0, 0),
(18, 1, 'make 300 playlists about pre-system life', 0, 0),
(19, 1, 'Commit Crimes', 0, 0),
(20, 1, 'fake their own death', 0, 0),
(21, 1, 'win a staring contest', 0, 0),
(22, 1, 'break a world record for most selfies in under 3 minutes', 0, 0),
(23, 1, 'bite someone', 0, 0),
(24, 1, 'win this game', 0, 0),
(25, 1, 'forget their PK/tupper proxy', 0, 0),
(26, 1, 'survive a zombie apocalypse', 0, 0),
(27, 1, 'start a fight', 0, 0),
(28, 1, 'lose a fight', 0, 0),
(29, 1, 'win a fight', 0, 0),
(30, 1, 'keep a secret', 0, 0),
(31, 1, 'not keep a secret', 0, 0),
(32, 1, 'accidentally say \'we\' instead of \'I\'', 0, 0),
(33, 1, 'make dad jokes', 0, 0),
(34, 1, 'know all the words to Never Gonna Give You Up', 0, 0),
(35, 1, 'get away with murder', 0, 0),
(36, 1, 'fall for an internet scam', 0, 0),
(37, 1, 'get roped into a pyramid scheme', 0, 0),
(38, 1, 'eat something off the ground', 0, 0),
(39, 1, 'summon a demon', 0, 0),
(40, 1, 'build a nuclear reactor in their garage', 0, 0),
(41, 1, 'fall down the stairs', 0, 0),
(42, 1, 'forget their own birthday', 0, 0),
(43, 1, 'start a fire while cooking', 0, 0),
(44, 1, 'cry at Hallmark movies', 0, 0),
(45, 1, 'cry at commercials', 0, 0),
(46, 1, 'bribe other system-members into doing chores', 0, 0),
(47, 1, 'be bribed into doing chores', 0, 0),
(48, 1, 'rob a bank', 0, 0),
(49, 1, 'sing in the shower', 0, 0),
(50, 1, 'pull an all-nighter', 0, 0),
(51, 1, '(insects) ||eat a bug||', 0, 0),
(52, 1, 'steal something', 0, 0),
(53, 1, 'pass out on a rollercoaster', 0, 0),
(54, 1, 'pack-bond with the roomba', 0, 0),
(55, 1, 'get stuck in headspace', 0, 0),
(56, 1, 'overthink Absolutely Everything', 0, 0),
(57, 1, 'drink so much caffeine they can taste colors', 0, 0),
(58, 1, 'deep-clean the whole house at midnight', 0, 0),
(59, 1, 'give up and move to Florida', 0, 0),
(60, 1, 'accidentally join a cult', 0, 0),
(61, 1, 'dye their hair', 0, 0),
(62, 1, 'be just a Little Problematic:tm:', 0, 0),
(63, 1, 'go viral for doing TikTok dances', 0, 0),
(64, 1, 'be perfect and never make mistakes ever', 0, 0),
(65, 1, 'go to hell (this one could be hilarious or need to be skipped depending on who\'s playing lmao)', 0, 0),
(66, 1, 'lick things to claim them as their own', 0, 0),
(67, 1, 'become Fandom Popular:tm:', 0, 0),
(73, 3, '@\'s hilarious new TV show: ___!', 0, 0),
(74, 3, 'Coming soon: ___, a novel by @!', 0, 0),
(75, 3, '@\'s favorite curse word: ___!', 0, 0),
(76, 3, '@\'s worst nightmare: ___!', 0, 0),
(77, 3, '@\'s beauty, @\'s grace, @\'s ___!', 0, 0),
(78, 3, 'A toast to love, peace, and @\'s ___.', 0, 0),
(79, 3, 'What did @ get cancelled for?', 0, 0),
(80, 3, 'What does @ do really well?', 0, 0),
(81, 3, 'Why would @ go to hell?', 0, 0),
(82, 3, '@ gets all their serotonin from ___.', 0, 0),
(83, 3, 'Well, @ has developed a fandom for ___, apparently.', 0, 0),
(84, 3, 'What is @ doing at 3AM?', 0, 0),
(85, 3, 'What would @ write a 190k fanfic about on AO3?', 0, 0),
(86, 3, '@\'s DNA test shows they\'re 100% ___.', 0, 0),
(87, 3, '@ loves ___.', 0, 0),
(88, 3, 'What is @ worst at?', 0, 0),
(89, 3, 'What is @ best at?', 0, 0),
(90, 3, '@\'s idea of the end of the world is ___.', 0, 0),
(91, 3, 'What does @ do to express normal healthy human love?', 0, 0),
(92, 3, '@ achieves their dream by ___!', 0, 0),
(93, 3, '@\'s wild alien encounter involves ___.', 0, 0),
(94, 3, '@\'s pathetic snack is ___.', 0, 0),
(95, 3, '@\'s role in the school play is ___.', 0, 0),
(97, 3, 'What does @ do when thrown in the middle of the dance circle?', 0, 0),
(98, 3, 'What\'s @ idea of a romantic gesture?', 0, 0),
(99, 3, 'How does @ like their coffee?', 0, 0),
(100, 3, 'What is @ singing in the shower?', 0, 0),
(101, 3, 'What is the first thing @ does in the morning?', 0, 0),
(103, 3, 'What does @ do while lucid dreaming?', 0, 0),
(104, 3, 'Why is @ busy right now?', 0, 0),
(105, 3, '@\'s most important achievement is ___!', 0, 0),
(106, 3, 'Maybe @\'s born with it, maybe it\'s ___.', 0, 0),
(107, 3, '@\'s wildest Friday night is ___.', 0, 0),
(108, 3, 'How does @ maintain such a healthy glow?', 0, 0),
(109, 3, '@ can\'t leave the house without ___.', 0, 0),
(110, 3, 'What keeps @ up at night?', 0, 0),
(111, 3, 'What is @\'s general vibe?', 0, 0),
(112, 3, 'What is @ arguing about on the internet?', 0, 0),
(113, 3, 'What is @ doing in the apocalypse?', 0, 0),
(114, 3, 'What is @\'s desire for a better world?', 0, 0),
(115, 3, 'Why is @ getting up early?', 0, 0),
(116, 3, '@\'s most toxic trait? ___.', 0, 0),
(117, 3, '@\'s most recent search history listing: ___.', 0, 0),
(118, 3, 'Oh, @\'s infodumping about ___ again!', 0, 0),
(119, 3, 'Why is @ giving up and moving to Florida?', 0, 0),
(120, 3, 'What made @ accidentally join a cult?', 0, 0),
(121, 3, '@ faked their own death by ___.', 0, 0),
(122, 3, 'Why would @ have their own fandom?', 0, 0),
(123, 3, 'Why did @ sell their soul?', 0, 0),
(125, 3, 'What crimes has @ committed now??', 0, 0),
(126, 3, 'Why did @ start a fight?', 0, 0),
(127, 3, 'How does @ get away with murder?', 0, 0),
(128, 3, '@\'s mortal enemy: ___!', 0, 0),
(129, 3, 'What is @\'s newest hyperfixation?', 0, 0),
(130, 3, '___? Hottest thing about @.', 1, 0),
(131, 3, 'How would @ die in a horror movie?', 0, 0),
(132, 3, '@\'s sexiest trait: ___.', 1, 0),
(133, 1, 'get arrested', 0, 0),
(134, 1, 'drop something on the floor and still eat it', 0, 0),
(135, 1, 'give the best advice', 0, 0),
(136, 1, 'eat another system-member\'s food', 0, 1),
(137, 1, 'get a speeding ticket', 0, 0),
(138, 1, 'get locked out of the house', 0, 0),
(139, 3, 'What is @\'s guilty pleasure?', 0, 0),
(140, 3, '@\'s greatest superpower: ___!', 0, 0),
(141, 3, 'Just released: ___, a song by @!', 0, 0),
(142, 3, '@\'s in the news! What\'s the headline?', 0, 0),
(143, 3, 'If @ had their own talk show, their first guest would be ___.', 0, 0),
(144, 3, '@ won a Nobel prize for ___!', 0, 0),
(145, 2, 'What is the most important milestone of this century?', 0, 0),
(146, 2, 'Goodnight to everyone except ___.', 0, 0),
(147, 2, '___? CANCELLED.', 0, 0),
(148, 2, 'I may be small, and I may be weak, but at least I have ___.', 0, 0),
(149, 2, 'What sounds nice on paper but is awful in real life?', 0, 0),
(150, 2, '___, my biggest life aspiration.', 0, 0),
(151, 2, 'I knew about ___ before it was cool!', 0, 0),
(152, 2, 'And it all went downhill after ___.', 0, 0),
(153, 2, 'One thing you can never change my mind about is ___!', 0, 0),
(154, 2, 'The one thing I\'d give a TED talk about is ___.', 0, 0),
(155, 2, 'DNI if you are: >18, a TERF, a fascist, or ___!', 0, 0),
(156, 2, 'What sent me to hell?', 0, 0),
(157, 2, 'The secret to happiness is ___.', 0, 0),
(158, 2, 'True chaos is ___.', 0, 0),
(159, 2, 'I get all my serotonin from ___.', 0, 0),
(160, 2, 'The newest thing being killed by millenials: ___.', 0, 0),
(161, 2, 'Well, ___ has developed a fandom, apparently.', 0, 0),
(162, 2, 'You have committed crimes against Skyrim and her people! What say you in your defense?', 0, 0),
(163, 2, '3AM... Time to ___.', 0, 0),
(164, 2, 'Gays can only do one: drive, do math, or ___.', 0, 0),
(165, 2, 'What\'s my gender?', 0, 0),
(166, 2, 'That\'s it, I\'m launching ___ into the sun.', 0, 0),
(167, 2, 'What\'s that sound?', 0, 0),
(168, 2, 'What are you thankful for?', 0, 0),
(169, 2, 'If you didn\'t want a 30-minute rant, you shouldn\'t have mentioned ___!', 0, 0),
(170, 2, 'I get by with a little help from ___.', 0, 0),
(171, 2, 'What\'s the gay agenda?', 0, 0),
(172, 2, 'This is the prime of my life. I\'m young, hot, and full of ___.', 0, 0),
(173, 2, 'Future historians will agree that ___ marked the beginning of the USA\'s decline.', 0, 0),
(174, 2, 'If at first you don\'t succeed, try ___.', 0, 0),
(175, 2, 'Money can\'t buy me love, but it *can* buy me ___.', 0, 0),
(176, 2, 'My plan for world domination begins with ___.', 0, 0),
(177, 2, 'Only two things in life are certain: death and ___.', 0, 0),
(178, 2, 'Science will never explain ___.', 0, 0),
(179, 2, 'What\'s the next superhero?', 0, 0),
(180, 2, 'Why can\'t I sleep at night?', 0, 0),
(181, 2, '___? No.', 0, 0),
(182, 2, 'All I want for the holidays is ___!', 0, 0),
(183, 2, 'Anyone can dance! Just throw your hands I the air and pretend you’re ___!', 0, 0),
(184, 2, 'It\'s just you, me, and ___ now.', 0, 0),
(185, 2, 'The aliens are here. They want ___.', 0, 0),
(186, 2, 'What pairs best with peanut butter?', 0, 0),
(187, 2, 'Now introducing: a sommelier for ___!', 0, 0),
(188, 2, 'Time to put on my favorite t-shirt, the one that says \'I 🖤 ___.\'', 0, 0),
(189, 2, 'What really killed the dinosaurs?', 0, 0),
(190, 2, 'It\'s all fun and games until ___!', 0, 0),
(191, 2, 'When I look in the mirror, I see ___.', 0, 0),
(192, 2, 'You\'re grounded! No ___ for a whole week.', 0, 0),
(193, 2, 'That\'s it! I\'m going to the one place uncorrupted by capitalism! ___!', 0, 0),
(194, 2, 'Here\'s something I learned in business school: the customer is always ___!', 0, 0),
(195, 2, 'My love language is ___.', 0, 0),
(196, 2, 'Alright! Answered two whole emails. Time to reward myself with ___.', 0, 0),
(197, 2, 'Hello, I\'m Mark Zuckerberg. Welcome to The Metaverse, where you can experience ___ like never before.', 0, 0),
(198, 2, 'I\'m afraid your college application needs some work. ___ is not an extracurricular activity.', 0, 0),
(199, 2, 'My friend and I saw you across the bar, and we love your vibe. Would you be interested in _______?', 0, 0),
(200, 2, 'Nah, I don\'t mess with ___.', 0, 0),
(201, 2, 'Welcome to the world\'s spookiest haunted house! We\'ve got thrills! We\'ve got chills! We\'ve got ___!', 0, 0),
(202, 2, 'Scientists discovered the fifth dimension, and it\'s ___.', 0, 0),
(203, 2, '___ is back! Only at McDonald\'s.', 0, 0),
(204, 2, 'I\'ll never be the same after ___.', 0, 0),
(205, 2, 'After months of practice, I think I\'m finally ready for ___.', 0, 0),
(206, 2, 'Damn it, you can\'t just solve every problem with ___!', 0, 0),
(207, 2, 'What\'s a solution to all of humanity\'s problems?', 0, 0),
(208, 2, 'In the end, the dragon wasn\'t evil. He just wanted ___.', 0, 0),
(209, 2, 'Critics are raving about the new fantasy series ___!', 0, 0),
(210, 2, '___ is OP. Please nerf.', 0, 0),
(211, 2, 'Achievement unlocked: ___!', 0, 0),
(212, 2, 'Press ↓ ↓ ← → B to unleash ___!', 0, 0),
(213, 2, 'What made me cry?', 0, 0),
(214, 2, '*LUKE, I AM YOUR ___!*', 0, 0),
(215, 2, 'The fault, dear Brutus, is not in our stars, but in ___.', 0, 0),
(216, 2, 'What\'s the truth?', 0, 0),
(217, 2, 'Before the Big Bang, there was ___.', 0, 0),
(218, 2, 'Today on Mythbusters: ___!', 0, 0),
(219, 2, 'We\'re here! We\'re ___! Get used to it!', 0, 0),
(220, 2, 'Hallmark has invented a new holiday. It\'s called ___!', 0, 0),
(221, 2, 'Roses are red, violets are blue, ___ is sweet, and so are you.', 0, 0),
(222, 2, 'Time is an illusion, and so is ___.', 0, 0),
(223, 2, 'You want ___? You can\'t handle it!', 0, 0),
(224, 2, 'I\'m not going to lie. I despise ___. There, I said it.', 0, 0),
(225, 2, 'Hey, you guys want to try this awesome new game? It’s called ___!', 0, 0),
(226, 2, '___. This changes everything.', 0, 0),
(227, 2, 'In case of emergency, call ___.', 0, 0),
(228, 2, 'Why didn\'t I show up for work?', 0, 0),
(229, 2, '___ is coming! Run for your life!', 0, 0),
(230, 2, 'Might fuck around and ___.', 1, 0),
(231, 2, 'I don\'t care what a person looks like. As long as they\'re ___, I\'ll fuck them.', 1, 0),
(232, 2, 'Subscribe to my OnlyFans for daily pictures of ___!', 1, 0),
(233, 2, 'Sure, sex is great, but have you tried ___?', 1, 0),
(234, 2, 'When all else fails, I can always masturbate to ___.', 1, 0),
(235, 2, 'How did I lose my virginity?', 1, 0),
(236, 2, 'Fun tip! When your partner asks you to go down on them, try surprising them with ___ instead.', 1, 0),
(237, 2, 'The best part of being a system is ___.', 0, 1),
(238, 2, 'The worst part of being a system is ___.', 0, 1),
(239, 2, 'I swear I get a new headmate every time I ___.', 0, 1),
(240, 2, 'You can\'t do ___! We share a body!', 0, 1),
(241, 2, 'If we didn\'t share a body, I would absolutely be ___ right now.', 0, 1),
(242, 2, 'Don\'t front right now, I\'m ___.', 0, 1),
(243, 2, 'It\'s all fun and games until someone introjects ___!', 0, 1),
(244, 2, 'Before we figured out we\'re plural, we really thought we were ___.', 0, 1),
(245, 2, 'pk;m new ___', 0, 1),
(246, 2, 'My strongest front trigger? ___.', 0, 1),
(247, 2, 'People think being a system is this big scary thing, when really it\'s ___.', 0, 1),
(248, 2, 'What trouble did I get into last time I was fronting?', 0, 1),
(249, 2, 'What\'s the most inconvenient time to switch?', 0, 1),
(251, 2, 'The one thing that always makes me dissociate is ___.', 0, 0),
(252, 2, 'How dissociated am I? Well, ___!', 0, 0),
(253, 2, 'Nothing kicks off the anxiety quite like ___!', 0, 0),
(254, 3, 'What got @ into trouble last time they were fronting?', 0, 1),
(255, 2, 'What got @ into trouble last time they were fronting?', 0, 1),
(256, 2, 'The most embarrassing crime to get caught comitting:', 0, 0),
(257, 2, 'The worst Halloween costume:', 0, 0),
(258, 2, 'The best way to blow a million dollars:', 0, 0),
(259, 2, 'The one thing the NSA is tired of watching us type into Google:', 0, 0),
(260, 2, 'The worst thing to find frozen in an ice cube:', 0, 0),
(263, 2, 'What two words would passengers never want to hear a pilot say?', 0, 0),
(264, 2, 'The secret to a happy life:', 0, 0),
(266, 2, 'What bears dream about all winter:', 0, 0),
(268, 2, 'A strange thing to keep as a pet:', 0, 0),
(269, 2, 'In 25 years, people will look back and think we\'re morons for not realizing that ___!', 0, 0),
(270, 2, 'What will be the hot new fashion trend in 2050?', 0, 0),
(271, 2, 'In the future, robots will do everything for us except ___.', 0, 0),
(272, 2, 'What you wish you could say to yourself as a high schooler:', 0, 0),
(273, 2, 'A terrible thing to carve into a tree:', 0, 0),
(274, 2, 'The worst curse: every full moon you turn into:', 0, 0),
(275, 2, 'A good sign that your house is haunted:', 0, 0),
(276, 2, 'A weird plan for saving the manatees:', 0, 0),
(277, 2, 'The name of a really crappy robot:', 0, 0),
(278, 2, 'You know you have a shady landlord when:', 0, 0),
(279, 2, 'The worst Vegas casino: ___ Palace', 1, 0),
(280, 2, 'The unsexiest thought you can have:', 1, 0),
(281, 2, 'An adult version of any classic video game:', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `responses`
--

CREATE TABLE `responses` (
  `qid` int(11) NOT NULL,
  `gameid` int(11) NOT NULL,
  `playerid` int(11) NOT NULL,
  `playername` tinytext NOT NULL,
  `response` text NOT NULL,
  `response2` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  MODIFY `gameid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT for table `gametracking`
--
ALTER TABLE `gametracking`
  MODIFY `qid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=291;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `playerid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `prompts`
--
ALTER TABLE `prompts`
  MODIFY `promptid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=282;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
