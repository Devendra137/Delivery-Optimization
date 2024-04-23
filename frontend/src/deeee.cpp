#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

vector<pair<int, int>> divide_land(int N, int L, vector<int> &land_values)
{
    vector<pair<int, int>> chosen_segments;

    // Create a vector of pairs containing segment index and its money value
    vector<pair<int, int>> segments;
    for (int i = 0; i < L; ++i)
    {
        segments.push_back({i, land_values[i]});
    }

    // Sort segments based on their money value
    sort(segments.begin(), segments.end(), [](const pair<int, int> &a, const pair<int, int> &b)
         { return a.second < b.second; });

    for (int i = 0; i < N; ++i)
    {
        int max_sum = 0;
        int start_segment = -1;
        int end_segment = -1;

        // Iterate over each segment to find the maximum sum
        for (int j = 0; j < L; ++j)
        {
            int current_sum = 0;
            for (int k = j; k < L; ++k)
            {
                current_sum += segments[k].second;
                if (current_sum > max_sum)
                {
                    max_sum = current_sum;
                    start_segment = segments[j].first;
                    end_segment = segments[k].first;
                }
            }
        }

        // Record the chosen segment and remove it and its adjacent segments
        chosen_segments.push_back({start_segment, end_segment});
        segments.erase(segments.begin() + start_segment, segments.begin() + end_segment + 1);
    }

    return chosen_segments;
}

int main()
{
    int N = 3;                                 // Number of sons
    int L = 10;                                // Number of segments
    vector<int> land_values = {3, 1, 4, 2, 5}; // Money values of each segment

    vector<pair<int, int>> chosen_segments = divide_land(N, L, land_values);

    // Output the chosen segments
    for (auto &segment : chosen_segments)
    {
        cout << "(" << segment.first << ", " << segment.second << ")" << endl;
    }

    return 0;
}
