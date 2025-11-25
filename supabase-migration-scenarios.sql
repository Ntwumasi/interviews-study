-- Migration: Add Interview Scenarios for Launch
-- Date: 2025-11-25
-- Description: Adds 9 interview scenarios (3 per type) for production launch

-- ============================================
-- CODING SCENARIOS (3 scenarios: easy, medium, hard)
-- ============================================

-- Coding Scenario 1: Easy - Valid Palindrome
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'coding',
    'Valid Palindrome',
    'Determine if a string is a palindrome, considering only alphanumeric characters and ignoring case. A classic string manipulation problem that tests your understanding of two-pointer technique.',
    'easy',
    ARRAY['strings', 'two-pointers', 'clean-code'],
    'Given a string s, return true if it is a palindrome, or false otherwise.

A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Example 1:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.

Example 2:
Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.

Example 3:
Input: s = " "
Output: true
Explanation: After removing non-alphanumeric characters, s is an empty string "".

Constraints:
- 1 <= s.length <= 2 * 10^5
- s consists only of printable ASCII characters

Instructions:
1. Start by discussing your approach with the interviewer
2. Consider edge cases (empty string, single character, special characters only)
3. Implement your solution
4. Analyze time and space complexity
5. Discuss potential optimizations',
    60
) ON CONFLICT DO NOTHING;

-- Coding Scenario 2: Medium - LRU Cache
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'coding',
    'LRU Cache',
    'Design and implement a Least Recently Used (LRU) cache. This problem tests your understanding of data structures, specifically combining hash maps with doubly linked lists.',
    'medium',
    ARRAY['design', 'hash-table', 'linked-list', 'data-structures'],
    'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if it exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if it exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity, evict the least recently used key.

The functions get and put must each run in O(1) average time complexity.

Example:
Input:
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]

Output:
[null, null, null, 1, null, -1, null, -1, 3, 4]

Explanation:
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // cache is {1=1}
lRUCache.put(2, 2); // cache is {1=1, 2=2}
lRUCache.get(1);    // return 1
lRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}
lRUCache.get(2);    // returns -1 (not found)
lRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}
lRUCache.get(1);    // return -1 (not found)
lRUCache.get(3);    // return 3
lRUCache.get(4);    // return 4

Instructions:
1. Discuss what data structures would be best for O(1) operations
2. Draw out your approach before coding
3. Implement the class with all methods
4. Walk through your solution with an example
5. Discuss edge cases and potential improvements',
    60
) ON CONFLICT DO NOTHING;

-- Coding Scenario 3: Hard - Merge K Sorted Lists
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'coding',
    'Merge K Sorted Lists',
    'Merge k sorted linked lists into one sorted linked list. This problem tests your knowledge of heaps/priority queues, divide and conquer, and linked list manipulation.',
    'hard',
    ARRAY['linked-list', 'heap', 'divide-conquer', 'merge-sort'],
    'You are given an array of k linked lists, each sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.

Example 1:
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked lists are:
[1->4->5, 1->3->4, 2->6]
Merging them into one sorted list: 1->1->2->3->4->4->5->6

Example 2:
Input: lists = []
Output: []

Example 3:
Input: lists = [[]]
Output: []

Constraints:
- k == lists.length
- 0 <= k <= 10^4
- 0 <= lists[i].length <= 500
- -10^4 <= lists[i][j] <= 10^4
- lists[i] is sorted in ascending order
- The sum of lists[i].length will not exceed 10^4

Instructions:
1. Discuss multiple approaches (brute force, merge pairs, priority queue)
2. Analyze trade-offs between approaches
3. Implement your chosen solution
4. Analyze time and space complexity for your approach
5. Compare with alternative solutions
6. Discuss how this would work at scale (millions of lists)',
    60
) ON CONFLICT DO NOTHING;

-- ============================================
-- SYSTEM DESIGN SCENARIOS (3 scenarios: medium, hard, hard)
-- ============================================

-- System Design Scenario 1: Medium - URL Shortener
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'system_design',
    'Design a URL Shortener',
    'Design a URL shortening service like bit.ly or TinyURL. This is a classic system design problem that covers many fundamental concepts including hashing, databases, and scalability.',
    'medium',
    ARRAY['distributed-systems', 'databases', 'caching', 'api-design'],
    'Design a URL shortening service like bit.ly.

Functional Requirements:
- Given a long URL, generate a short unique alias
- When users access the short URL, redirect to the original URL
- Users can optionally pick a custom short link
- Links expire after a default timespan (configurable)

Non-Functional Requirements:
- The system should be highly available
- URL redirection should happen in real-time with minimal latency
- Shortened links should not be predictable

Extended Requirements:
- Analytics: how many times a link was accessed
- REST API for third-party integrations

Things to discuss:
1. How would you generate unique short URLs?
2. Database schema design
3. How would you handle collisions?
4. Caching strategy
5. How would you scale to handle 100M URLs?
6. Rate limiting and abuse prevention

Use the diagram canvas to illustrate your architecture.',
    45
) ON CONFLICT DO NOTHING;

-- System Design Scenario 2: Hard - Design Twitter
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'system_design',
    'Design Twitter',
    'Design a social media platform like Twitter with timeline generation, following system, and real-time updates. This problem covers feed generation, fan-out strategies, and handling high read/write ratios.',
    'hard',
    ARRAY['social-media', 'feed-generation', 'fan-out', 'real-time', 'caching'],
    'Design a Twitter-like social media service.

Core Features:
- Users can post tweets (280 character limit)
- Users can follow other users
- Users have a home timeline showing tweets from people they follow
- Users can like, retweet, and reply to tweets

Scale Requirements:
- 500 million users
- 200 million daily active users
- 500 million tweets per day
- Average user follows 200 people
- Timeline loads in < 200ms

Key Design Challenges:
1. Timeline Generation: How do you build a users home timeline?
   - Pull model (fetch on request) vs Push model (fan-out on write)
   - Hybrid approach for celebrities vs regular users

2. Data Storage:
   - How would you store tweets, users, and relationships?
   - SQL vs NoSQL trade-offs
   - How would you shard the data?

3. Caching Strategy:
   - What would you cache?
   - Cache invalidation strategy

4. Real-time Updates:
   - How would you push new tweets to connected users?
   - WebSockets, Server-Sent Events, or polling?

5. Search and Trends:
   - How would you implement hashtag search?
   - How would you calculate trending topics?

Use the diagram canvas to draw your architecture including:
- Client applications
- Load balancers
- Application servers
- Databases
- Caching layers
- Message queues',
    45
) ON CONFLICT DO NOTHING;

-- System Design Scenario 3: Hard - Design a Distributed Cache
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'system_design',
    'Design a Distributed Cache',
    'Design a distributed caching system like Redis or Memcached. This problem tests deep understanding of distributed systems, consistency, partitioning, and replication.',
    'hard',
    ARRAY['distributed-systems', 'caching', 'consistency', 'partitioning', 'replication'],
    'Design a distributed cache like Redis.

Functional Requirements:
- Support basic operations: GET, SET, DELETE
- Support TTL (Time To Live) for cache entries
- Support multiple data types (strings, lists, sets, hashes)
- Atomic operations (increment, decrement)

Non-Functional Requirements:
- Low latency (sub-millisecond for most operations)
- High availability (99.99% uptime)
- Scalable to petabytes of data
- Handle millions of requests per second

Key Design Challenges:

1. Data Partitioning:
   - How do you distribute data across nodes?
   - Consistent hashing vs range-based partitioning
   - How do you handle hotspots?

2. Replication:
   - How do you replicate data for fault tolerance?
   - Leader-follower vs leaderless replication
   - Synchronous vs asynchronous replication

3. Consistency:
   - What consistency guarantees do you provide?
   - How do you handle network partitions?
   - CAP theorem trade-offs

4. Eviction Policies:
   - LRU, LFU, or other eviction strategies
   - How do you implement efficient eviction?

5. Failure Handling:
   - How do you detect node failures?
   - How do you handle failover?
   - How do you rebalance data when nodes join/leave?

6. Client Library Design:
   - Connection pooling
   - Retry logic and circuit breakers

Draw your architecture showing:
- Cache nodes and their replication
- Coordination service (if any)
- Client routing logic
- Data flow for reads and writes',
    45
) ON CONFLICT DO NOTHING;

-- ============================================
-- BEHAVIORAL SCENARIOS (3 scenarios: medium, medium, hard)
-- ============================================

-- Behavioral Scenario 1: Medium - Conflict Resolution
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'behavioral',
    'Resolving Team Conflict',
    'Describe a situation where you had a significant disagreement with a colleague or team member. Interviewers want to see how you handle interpersonal challenges while maintaining professional relationships.',
    'medium',
    ARRAY['conflict-resolution', 'communication', 'teamwork', 'emotional-intelligence'],
    'Tell me about a time when you had a significant disagreement with a team member or colleague. How did you handle it?

The interviewer is looking for:
- Your ability to handle conflict professionally
- How you communicate during disagreements
- Your problem-solving approach in interpersonal situations
- Evidence of emotional intelligence
- The outcome and what you learned

Use the STAR format:
- Situation: Set the context. What was the project? Who was involved?
- Task: What was your responsibility? What was at stake?
- Action: What specific steps did you take to resolve the conflict?
- Result: What was the outcome? What did you learn?

Good answers typically include:
- Acknowledging the other persons perspective
- Focusing on the problem, not the person
- Seeking to understand before being understood
- Finding common ground or compromise
- Maintaining the relationship after resolution

Avoid:
- Blaming others entirely
- Showing no self-reflection
- Leaving conflicts unresolved
- Escalating to management as first resort',
    30
) ON CONFLICT DO NOTHING;

-- Behavioral Scenario 2: Medium - Leadership Without Authority
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'behavioral',
    'Leading Without Authority',
    'Describe a time when you had to lead a project or initiative without formal authority. This question assesses your influence, persuasion, and ability to drive results through collaboration.',
    'medium',
    ARRAY['leadership', 'influence', 'collaboration', 'initiative'],
    'Tell me about a time when you led a project or drove an initiative without having formal authority over the team.

The interviewer is looking for:
- Your ability to influence without direct authority
- How you build consensus and motivate others
- Your communication and persuasion skills
- Evidence of taking initiative
- Results you achieved through collaboration

Use the STAR format:
- Situation: What was the project/initiative? Why was it important?
- Task: What was your role? Why didnt you have formal authority?
- Action: How did you gain buy-in? How did you coordinate the team?
- Result: What was the outcome? What impact did it have?

Strong answers demonstrate:
- Building relationships and trust first
- Understanding others motivations and concerns
- Creating a compelling vision others want to join
- Recognizing and crediting team contributions
- Measurable positive outcomes

Questions to consider:
- How did you get initial buy-in?
- How did you handle resistance or skeptics?
- How did you keep the team motivated?
- What would you do differently next time?',
    30
) ON CONFLICT DO NOTHING;

-- Behavioral Scenario 3: Hard - Delivering Bad News / Difficult Decision
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'behavioral',
    'Making a Difficult Technical Decision',
    'Describe a time when you had to make a difficult technical decision that affected your team or organization. This question assesses your judgment, communication, and ability to handle ambiguity.',
    'hard',
    ARRAY['decision-making', 'technical-leadership', 'communication', 'trade-offs'],
    'Tell me about a time when you had to make a difficult technical decision. How did you approach it, and what was the outcome?

The interviewer is looking for:
- Your decision-making framework
- How you gather information and evaluate trade-offs
- Your ability to communicate technical decisions to stakeholders
- How you handle uncertainty and risk
- Evidence of ownership and accountability

Use the STAR format:
- Situation: What was the technical context? What made the decision difficult?
- Task: What were you responsible for deciding? What were the stakes?
- Action: What was your process? How did you evaluate options?
- Result: What did you decide? What was the outcome?

Strong answers include:
- Clear criteria for the decision
- Consultation with relevant stakeholders
- Consideration of short-term vs long-term trade-offs
- Risk assessment and mitigation planning
- Taking ownership of the decision and its consequences
- Lessons learned, even if the outcome wasnt perfect

Example scenarios to draw from:
- Choosing between build vs buy
- Deciding to rewrite vs refactor legacy code
- Selecting a technology stack for a new project
- Killing a project that wasnt working
- Making trade-offs between speed and quality
- Handling technical debt vs new features

Be prepared to discuss:
- What alternatives did you consider?
- Who did you involve in the decision?
- How did you communicate the decision?
- What would you do differently knowing what you know now?',
    30
) ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify the migration

-- Count scenarios by type
-- SELECT interview_type, COUNT(*) as count, array_agg(title)
-- FROM scenarios
-- GROUP BY interview_type
-- ORDER BY interview_type;

-- View all scenarios
-- SELECT id, interview_type, title, difficulty, duration_minutes
-- FROM scenarios
-- ORDER BY interview_type, difficulty;
