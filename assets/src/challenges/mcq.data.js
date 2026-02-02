/**
 * MCQ Data Store
 * Static data for MCQ challenges and questions
 * No side effects, pure data access
 */

import { DIFFICULTY_LEVELS } from './challenges.constants.js';

// Sample MCQ Challenges
const MCQ_CHALLENGES = [
    {
        mcq_challenge_id: 'cloud-basics-001',
        title: 'Cloud Computing Fundamentals',
        concept: 'Cloud Basics',
        difficulty: DIFFICULTY_LEVELS.BEGINNER,
        question_count: 5,
        time_limit: 300, // 5 minutes
        description: 'Test your understanding of basic cloud computing concepts including service models and deployment types.'
    },
    {
        mcq_challenge_id: 'aws-services-001',
        title: 'AWS Core Services',
        concept: 'AWS Services',
        difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
        question_count: 8,
        time_limit: 480, // 8 minutes
        description: 'Evaluate your knowledge of essential AWS services including EC2, S3, RDS, and Lambda.'
    },
    {
        mcq_challenge_id: 'security-basics-001',
        title: 'Cloud Security Essentials',
        concept: 'Security',
        difficulty: DIFFICULTY_LEVELS.BEGINNER,
        question_count: 6,
        time_limit: 360, // 6 minutes
        description: 'Assess your understanding of fundamental cloud security principles and best practices.'
    },
    {
        mcq_challenge_id: 'networking-001',
        title: 'Cloud Networking Concepts',
        concept: 'Networking',
        difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
        question_count: 7,
        time_limit: 420, // 7 minutes
        description: 'Test your knowledge of cloud networking including VPCs, subnets, and load balancing.'
    }
];

// Sample MCQ Questions
const MCQ_QUESTIONS = [
    // Cloud Basics Questions
    {
        question_id: 'cb-001',
        mcq_challenge_id: 'cloud-basics-001',
        question_text: 'What are the three main cloud service models?',
        options: {
            A: 'IaaS, PaaS, SaaS',
            B: 'Public, Private, Hybrid',
            C: 'CPU, Memory, Storage',
            D: 'Development, Testing, Production'
        },
        correct_option: 'A',
        explanation: 'The three main cloud service models are Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS).'
    },
    {
        question_id: 'cb-002',
        mcq_challenge_id: 'cloud-basics-001',
        question_text: 'Which cloud deployment model provides the highest level of control and security?',
        options: {
            A: 'Public Cloud',
            B: 'Private Cloud',
            C: 'Hybrid Cloud',
            D: 'Community Cloud'
        },
        correct_option: 'B',
        explanation: 'Private cloud provides the highest level of control and security as resources are dedicated to a single organization.'
    },
    {
        question_id: 'cb-003',
        mcq_challenge_id: 'cloud-basics-001',
        question_text: 'What is the primary benefit of cloud computing scalability?',
        options: {
            A: 'Reduced costs only',
            B: 'Better security',
            C: 'Ability to adjust resources based on demand',
            D: 'Faster internet connection'
        },
        correct_option: 'C',
        explanation: 'Scalability allows organizations to adjust computing resources up or down based on current demand.'
    },
    {
        question_id: 'cb-004',
        mcq_challenge_id: 'cloud-basics-001',
        question_text: 'Which characteristic is NOT typically associated with cloud computing?',
        options: {
            A: 'On-demand self-service',
            B: 'Broad network access',
            C: 'Physical hardware ownership',
            D: 'Resource pooling'
        },
        correct_option: 'C',
        explanation: 'Cloud computing eliminates the need for physical hardware ownership by the end user.'
    },
    {
        question_id: 'cb-005',
        mcq_challenge_id: 'cloud-basics-001',
        question_text: 'What does "elasticity" mean in cloud computing?',
        options: {
            A: 'The ability to stretch network cables',
            B: 'Automatic scaling of resources based on demand',
            C: 'Flexible payment options',
            D: 'The ability to change cloud providers'
        },
        correct_option: 'B',
        explanation: 'Elasticity refers to the automatic scaling of resources up or down based on current demand.'
    },

    // AWS Services Questions
    {
        question_id: 'aws-001',
        mcq_challenge_id: 'aws-services-001',
        question_text: 'What is Amazon EC2 primarily used for?',
        options: {
            A: 'Object storage',
            B: 'Virtual computing instances',
            C: 'Database management',
            D: 'Content delivery'
        },
        correct_option: 'B',
        explanation: 'Amazon EC2 (Elastic Compute Cloud) provides resizable virtual computing instances in the cloud.'
    },
    {
        question_id: 'aws-002',
        mcq_challenge_id: 'aws-services-001',
        question_text: 'Which AWS service is best for storing and retrieving any amount of data from anywhere?',
        options: {
            A: 'Amazon RDS',
            B: 'Amazon EC2',
            C: 'Amazon S3',
            D: 'Amazon Lambda'
        },
        correct_option: 'C',
        explanation: 'Amazon S3 (Simple Storage Service) is designed for storing and retrieving any amount of data from anywhere on the web.'
    },
    {
        question_id: 'aws-003',
        mcq_challenge_id: 'aws-services-001',
        question_text: 'What type of service is AWS Lambda?',
        options: {
            A: 'Database service',
            B: 'Serverless compute service',
            C: 'Storage service',
            D: 'Networking service'
        },
        correct_option: 'B',
        explanation: 'AWS Lambda is a serverless compute service that runs code without provisioning or managing servers.'
    },
    {
        question_id: 'aws-004',
        mcq_challenge_id: 'aws-services-001',
        question_text: 'Which AWS service provides managed relational databases?',
        options: {
            A: 'Amazon S3',
            B: 'Amazon EC2',
            C: 'Amazon RDS',
            D: 'Amazon CloudFront'
        },
        correct_option: 'C',
        explanation: 'Amazon RDS (Relational Database Service) provides managed relational databases in the cloud.'
    },
    {
        question_id: 'aws-005',
        mcq_challenge_id: 'aws-services-001',
        question_text: 'What is the primary purpose of Amazon CloudFront?',
        options: {
            A: 'Database replication',
            B: 'Content delivery network (CDN)',
            C: 'Server monitoring',
            D: 'Identity management'
        },
        correct_option: 'B',
        explanation: 'Amazon CloudFront is a content delivery network (CDN) that delivers content to users with low latency.'
    },
    {
        question_id: 'aws-006',
        mcq_challenge_id: 'aws-services-001',
        question_text: 'Which AWS service helps you monitor and manage your AWS resources?',
        options: {
            A: 'Amazon S3',
            B: 'Amazon CloudWatch',
            C: 'Amazon Lambda',
            D: 'Amazon RDS'
        },
        correct_option: 'B',
        explanation: 'Amazon CloudWatch provides monitoring and management capabilities for AWS resources and applications.'
    },
    {
        question_id: 'aws-007',
        mcq_challenge_id: 'aws-services-001',
        question_text: 'What does VPC stand for in AWS?',
        options: {
            A: 'Virtual Private Cloud',
            B: 'Very Powerful Computer',
            C: 'Verified Public Certificate',
            D: 'Virtual Processing Center'
        },
        correct_option: 'A',
        explanation: 'VPC stands for Virtual Private Cloud, which provides an isolated network environment in AWS.'
    },
    {
        question_id: 'aws-008',
        mcq_challenge_id: 'aws-services-001',
        question_text: 'Which AWS service is used for DNS management?',
        options: {
            A: 'Amazon CloudFront',
            B: 'Amazon Route 53',
            C: 'Amazon S3',
            D: 'Amazon EC2'
        },
        correct_option: 'B',
        explanation: 'Amazon Route 53 is a scalable DNS web service designed to route end users to internet applications.'
    },

    // Security Questions
    {
        question_id: 'sec-001',
        mcq_challenge_id: 'security-basics-001',
        question_text: 'What is the principle of least privilege in cloud security?',
        options: {
            A: 'Give users maximum access for convenience',
            B: 'Grant users only the minimum access needed for their job',
            C: 'Allow all users the same level of access',
            D: 'Restrict access only to administrators'
        },
        correct_option: 'B',
        explanation: 'The principle of least privilege means granting users only the minimum level of access needed to perform their job functions.'
    },
    {
        question_id: 'sec-002',
        mcq_challenge_id: 'security-basics-001',
        question_text: 'What is multi-factor authentication (MFA)?',
        options: {
            A: 'Using multiple passwords',
            B: 'Authentication using two or more verification factors',
            C: 'Having multiple user accounts',
            D: 'Using different browsers for login'
        },
        correct_option: 'B',
        explanation: 'Multi-factor authentication requires two or more verification factors to gain access to a resource.'
    },
    {
        question_id: 'sec-003',
        mcq_challenge_id: 'security-basics-001',
        question_text: 'What is encryption at rest?',
        options: {
            A: 'Encrypting data while it is being transmitted',
            B: 'Encrypting data while it is stored',
            C: 'Encrypting data while it is being processed',
            D: 'Encrypting data only during backups'
        },
        correct_option: 'B',
        explanation: 'Encryption at rest refers to encrypting data while it is stored on disk or in databases.'
    },
    {
        question_id: 'sec-004',
        mcq_challenge_id: 'security-basics-001',
        question_text: 'What is a security group in cloud computing?',
        options: {
            A: 'A team of security professionals',
            B: 'A virtual firewall that controls traffic',
            C: 'A physical security device',
            D: 'A group of encrypted files'
        },
        correct_option: 'B',
        explanation: 'A security group acts as a virtual firewall that controls inbound and outbound traffic for cloud resources.'
    },
    {
        question_id: 'sec-005',
        mcq_challenge_id: 'security-basics-001',
        question_text: 'What is the shared responsibility model in cloud security?',
        options: {
            A: 'Only the cloud provider is responsible for security',
            B: 'Only the customer is responsible for security',
            C: 'Security responsibilities are shared between provider and customer',
            D: 'Security is handled by third-party vendors only'
        },
        correct_option: 'C',
        explanation: 'The shared responsibility model divides security responsibilities between the cloud provider and the customer.'
    },
    {
        question_id: 'sec-006',
        mcq_challenge_id: 'security-basics-001',
        question_text: 'What is the purpose of Identity and Access Management (IAM)?',
        options: {
            A: 'To manage network traffic',
            B: 'To control who can access what resources',
            C: 'To encrypt data in transit',
            D: 'To monitor system performance'
        },
        correct_option: 'B',
        explanation: 'IAM is used to control and manage who can access what resources and what actions they can perform.'
    },

    // Networking Questions
    {
        question_id: 'net-001',
        mcq_challenge_id: 'networking-001',
        question_text: 'What is a subnet in cloud networking?',
        options: {
            A: 'A type of internet connection',
            B: 'A segmented portion of a larger network',
            C: 'A security protocol',
            D: 'A storage device'
        },
        correct_option: 'B',
        explanation: 'A subnet is a segmented portion of a larger network, typically used to organize and secure network resources.'
    },
    {
        question_id: 'net-002',
        mcq_challenge_id: 'networking-001',
        question_text: 'What is the primary purpose of a load balancer?',
        options: {
            A: 'To encrypt network traffic',
            B: 'To distribute incoming requests across multiple servers',
            C: 'To store network configurations',
            D: 'To monitor network performance'
        },
        correct_option: 'B',
        explanation: 'A load balancer distributes incoming network requests across multiple servers to ensure optimal resource utilization.'
    },
    {
        question_id: 'net-003',
        mcq_challenge_id: 'networking-001',
        question_text: 'What does CIDR stand for in networking?',
        options: {
            A: 'Centralized Internet Data Routing',
            B: 'Classless Inter-Domain Routing',
            C: 'Cloud Infrastructure Data Repository',
            D: 'Certified Internet Domain Registry'
        },
        correct_option: 'B',
        explanation: 'CIDR stands for Classless Inter-Domain Routing, a method for allocating IP addresses and routing.'
    },
    {
        question_id: 'net-004',
        mcq_challenge_id: 'networking-001',
        question_text: 'What is a NAT Gateway used for?',
        options: {
            A: 'To provide internet access to private subnets',
            B: 'To encrypt network traffic',
            C: 'To store network logs',
            D: 'To manage DNS records'
        },
        correct_option: 'A',
        explanation: 'A NAT Gateway allows instances in private subnets to access the internet while remaining private.'
    },
    {
        question_id: 'net-005',
        mcq_challenge_id: 'networking-001',
        question_text: 'What is the difference between a public and private subnet?',
        options: {
            A: 'Public subnets are faster',
            B: 'Public subnets have direct internet access, private subnets do not',
            C: 'Private subnets are more expensive',
            D: 'There is no difference'
        },
        correct_option: 'B',
        explanation: 'Public subnets have direct internet access through an internet gateway, while private subnets do not.'
    },
    {
        question_id: 'net-006',
        mcq_challenge_id: 'networking-001',
        question_text: 'What is an Internet Gateway?',
        options: {
            A: 'A security device',
            B: 'A component that allows communication between VPC and internet',
            C: 'A type of load balancer',
            D: 'A storage service'
        },
        correct_option: 'B',
        explanation: 'An Internet Gateway is a VPC component that allows communication between instances in your VPC and the internet.'
    },
    {
        question_id: 'net-007',
        mcq_challenge_id: 'networking-001',
        question_text: 'What is the purpose of a route table?',
        options: {
            A: 'To store user credentials',
            B: 'To define where network traffic is directed',
            C: 'To encrypt data packets',
            D: 'To monitor bandwidth usage'
        },
        correct_option: 'B',
        explanation: 'A route table contains rules (routes) that determine where network traffic is directed within a VPC.'
    }
];

/**
 * Get all available MCQ challenges
 * @returns {Array} Array of challenge objects
 */
export function getAllChallenges() {
    return [...MCQ_CHALLENGES]; // Return a copy to prevent mutation
}

/**
 * Get a specific challenge by ID
 * @param {string} challengeId - The challenge ID
 * @returns {Object|null} Challenge object or null if not found
 */
export function getChallengeById(challengeId) {
    return MCQ_CHALLENGES.find(challenge => challenge.mcq_challenge_id === challengeId) || null;
}

/**
 * Get all questions for a specific challenge
 * @param {string} challengeId - The challenge ID
 * @returns {Array} Array of question objects for the challenge
 */
export function getQuestionsForChallenge(challengeId) {
    return MCQ_QUESTIONS.filter(question => question.mcq_challenge_id === challengeId);
}

/**
 * Get a specific question by ID
 * @param {string} questionId - The question ID
 * @returns {Object|null} Question object or null if not found
 */
export function getQuestionById(questionId) {
    return MCQ_QUESTIONS.find(question => question.question_id === questionId) || null;
}

/**
 * Get challenges by difficulty level
 * @param {string} difficulty - The difficulty level
 * @returns {Array} Array of challenges matching the difficulty
 */
export function getChallengesByDifficulty(difficulty) {
    return MCQ_CHALLENGES.filter(challenge => challenge.difficulty === difficulty);
}

/**
 * Get challenges by concept
 * @param {string} concept - The concept name
 * @returns {Array} Array of challenges matching the concept
 */
export function getChallengesByConcept(concept) {
    return MCQ_CHALLENGES.filter(challenge => challenge.concept === concept);
}